from __future__ import annotations

import json
import re
from pathlib import Path

from .voicevox import (
    apply_speaker_settings,
    audio_query,
    check_voicevox,
    computed_duration,
    concat_wavs,
    measure_wav,
    mora_timings,
    synthesis,
    sync_user_dictionary,
    synthetic_audio_query,
    write_pause,
    write_silence_wav,
    write_voicevox_wav,
)


def _read_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _pause_after(
    current_scene: dict[str, object],
    current_utt: dict[str, object],
    next_scene: dict[str, object] | None,
    next_utt: dict[str, object] | None,
    pacing: dict[str, object],
) -> int:
    if "pause_after_ms" in current_utt:
        return int(current_utt["pause_after_ms"])
    intent = str(current_utt.get("intent") or "")
    rules = pacing.get("rules", {})
    if intent in rules:
        return int(rules[intent])
    if next_scene is None or next_utt is None:
        return 0
    if current_scene.get("id") != next_scene.get("id"):
        return int(rules.get("scene_boundary", 700))
    if current_utt.get("speaker") == next_utt.get("speaker"):
        return int(rules.get("same_speaker", 150))
    return int(rules.get("speaker_change", 300))


def _iter_utterances(script: dict[str, object]) -> list[tuple[dict[str, object], dict[str, object]]]:
    out: list[tuple[dict[str, object], dict[str, object]]] = []
    for scene in script.get("scenes", []):
        for utterance in scene.get("utterances", []):
            out.append((scene, utterance))
    return out


def _emphasis_timing(text: str, emphasis: str, absolute_start: float, timings: list[dict[str, object]]) -> dict[str, object]:
    index = text.find(emphasis)
    if index < 0 or not timings:
        return {"text": emphasis, "startSec": absolute_start, "endSec": absolute_start + min(0.9, max(0.35, len(emphasis) * 0.08)), "fallback": True}
    compact_before = re.sub(r"\s+", "", text[:index])
    compact_emphasis = re.sub(r"\s+", "", emphasis)
    start_mora = min(len(timings) - 1, len(compact_before))
    end_mora = min(len(timings) - 1, start_mora + max(1, len(compact_emphasis)) - 1)
    return {
        "text": emphasis,
        "startSec": absolute_start + float(timings[start_mora]["startSec"]),
        "endSec": absolute_start + float(timings[end_mora]["endSec"]),
    }


def build_audio_and_timeline(
    script: dict[str, object],
    build_dir: Path,
    pacing_path: Path,
    speakers_path: Path,
    pronunciation_path: Path,
    voicevox_url: str,
    mode: str,
    fps: int,
) -> dict[str, object]:
    build_dir.mkdir(parents=True, exist_ok=True)
    audio_query_dir = build_dir / "audio_query"
    wav_dir = build_dir / "wav"
    pacing = _read_json(pacing_path)
    speakers = _read_json(speakers_path)
    pronunciation = _read_json(pronunciation_path) if pronunciation_path.exists() else {"words": []}
    warnings: list[str] = []

    use_voicevox = mode == "voicevox" or (mode == "auto" and check_voicevox(voicevox_url))
    if mode == "voicevox" and not use_voicevox:
        raise RuntimeError(f"VOICEVOX is not reachable at {voicevox_url}")
    if not use_voicevox:
        warnings.append("VOICEVOX is not reachable; generated silent dry-run wav files")
    else:
        warnings.extend(sync_user_dictionary(voicevox_url, pronunciation.get("words", [])))

    utterance_items = _iter_utterances(script)
    rendered: list[dict[str, object]] = []
    wav_parts: list[Path] = []

    for index, (scene, utterance) in enumerate(utterance_items):
        speaker_key = str(utterance["speaker"])
        speaker = speakers["speakers"][speaker_key]
        text = str(utterance["text"])
        query = audio_query(voicevox_url, text, int(speaker["style_id"])) if use_voicevox else synthetic_audio_query(text, speaker)
        query = apply_speaker_settings(query, speaker)
        computed = computed_duration(query)
        query_path = audio_query_dir / f"utterance_{index:03d}.json"
        _write_json(query_path, {"sceneId": scene["id"], "utteranceIndex": index, "speaker": speaker_key, "text": text, "query": query})

        wav_path = wav_dir / f"utterance_{index:03d}.wav"
        if use_voicevox:
            write_voicevox_wav(wav_path, synthesis(voicevox_url, query, int(speaker["style_id"])))
        else:
            write_silence_wav(wav_path, computed)
        measured = measure_wav(wav_path)
        duration = computed
        if abs(measured - computed) > 0.05:
            warnings.append(f"utterance_{index:03d}: computed {computed:.3f}s vs measured {measured:.3f}s; measured duration adopted")
            duration = measured

        rendered.append(
            {
                "scene": scene,
                "utterance": utterance,
                "speaker": speaker_key,
                "text": text,
                "queryPath": str(query_path.relative_to(build_dir)),
                "wavPath": wav_path,
                "durationSec": duration,
                "moraTimings": mora_timings(query),
            }
        )

    cursor = 0.0
    scene_map: dict[str, dict[str, object]] = {}
    for index, item in enumerate(rendered):
        scene = item["scene"]
        utterance = item["utterance"]
        scene_id = str(scene["id"])
        if scene_id not in scene_map:
            copied = {k: v for k, v in scene.items() if k != "utterances"}
            copied["startSec"] = cursor
            copied["utterances"] = []
            scene_map[scene_id] = copied
        start = cursor
        end = cursor + float(item["durationSec"])
        emphasis = [
            _emphasis_timing(str(item["text"]), str(value), start, item["moraTimings"])
            for value in (utterance.get("emphasis") or [])
        ]
        scene_map[scene_id]["utterances"].append(
            {
                "speaker": item["speaker"],
                "text": item["text"],
                "startSec": start,
                "endSec": end,
                "durationSec": float(item["durationSec"]),
                "wav": str(item["wavPath"].relative_to(build_dir)),
                "emphasis": emphasis,
            }
        )
        wav_parts.append(item["wavPath"])
        cursor = end

        next_scene = rendered[index + 1]["scene"] if index + 1 < len(rendered) else None
        next_utt = rendered[index + 1]["utterance"] if index + 1 < len(rendered) else None
        pause_ms = _pause_after(scene, utterance, next_scene, next_utt, pacing)
        if pause_ms > 0:
            pause_path = wav_dir / f"pause_{index:03d}.wav"
            write_pause(pause_path, pause_ms)
            wav_parts.append(pause_path)
            cursor += pause_ms / 1000.0

    scenes: list[dict[str, object]] = []
    script_scenes = list(script.get("scenes", []))
    for scene_index, scene in enumerate(script_scenes):
        item = scene_map[str(scene["id"])]
        scene_utts = item["utterances"]
        utterance_end = max(float(u["endSec"]) for u in scene_utts)
        if scene_index + 1 < len(script_scenes):
            next_item = scene_map[str(script_scenes[scene_index + 1]["id"])]
            item["endSec"] = max(utterance_end, float(next_item["startSec"]))
        else:
            item["endSec"] = utterance_end
        scenes.append(item)

    narration = build_dir / "narration.wav"
    concat_wavs(wav_parts, narration)
    measured_total = measure_wav(narration)
    if abs(measured_total - cursor) > 0.05:
        warnings.append(f"narration total {measured_total:.3f}s differs from timeline {cursor:.3f}s")
        cursor = measured_total

    timeline = {
        "schemaVersion": 1,
        "fps": fps,
        "totalSec": cursor,
        "audio": "narration.wav",
        "meta": script.get("meta", {}),
        "speakers": script.get("speakers", {}),
        "pronunciation": {"wordCount": len(pronunciation.get("words", []))},
        "scenes": scenes,
        "warnings": warnings,
    }
    timeline_path = build_dir / "timeline.json"
    _write_json(timeline_path, timeline)
    return {"timeline": timeline_path, "narration": narration, "warnings": warnings}
