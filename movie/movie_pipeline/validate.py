from __future__ import annotations

import re


SCENE_TYPES = {"title", "hook", "quiz", "answer", "explain", "myth_bust", "takeaway", "sources"}


def _count_japanese_chars(value: str) -> int:
    return len(re.sub(r"\s+", "", value))


def validate_script(script: dict[str, object]) -> dict[str, list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    scenes = script.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        errors.append("scenes must be a non-empty list")
        return {"errors": errors, "warnings": warnings}

    total_chars = 0
    for scene_index, scene in enumerate(scenes):
        if not isinstance(scene, dict):
            errors.append(f"scene {scene_index} is not an object")
            continue
        scene_id = scene.get("id", f"scene[{scene_index}]")
        scene_type = scene.get("type")
        if scene_type not in SCENE_TYPES:
            errors.append(f"{scene_id}: unknown scene type {scene_type!r}")

        on_screen = scene.get("onScreen", {})
        if isinstance(on_screen, dict):
            headline = str(on_screen.get("headline") or on_screen.get("question") or "")
            if _count_japanese_chars(headline) > 34:
                warnings.append(f"{scene_id}: headline is long ({_count_japanese_chars(headline)} chars)")
            subhead = str(on_screen.get("subhead") or "")
            if _count_japanese_chars(subhead) > 64:
                warnings.append(f"{scene_id}: subhead is long ({_count_japanese_chars(subhead)} chars)")

        utterances = scene.get("utterances")
        if not isinstance(utterances, list) or not utterances:
            errors.append(f"{scene_id}: utterances must be a non-empty list")
            continue
        for utt_index, utterance in enumerate(utterances):
            if not isinstance(utterance, dict):
                errors.append(f"{scene_id}: utterance {utt_index} is not an object")
                continue
            speaker = utterance.get("speaker")
            if speaker not in ("teacher", "student"):
                errors.append(f"{scene_id}: utterance {utt_index} has unknown speaker {speaker!r}")
            text = str(utterance.get("text") or "").strip()
            if not text:
                errors.append(f"{scene_id}: utterance {utt_index} has empty text")
            total_chars += _count_japanese_chars(text)
            for emphasis in utterance.get("emphasis", []) or []:
                if str(emphasis) not in text:
                    warnings.append(f"{scene_id}: emphasis {emphasis!r} is not an exact substring")

    if total_chars < 1000:
        warnings.append(f"script may be short for a 5 minute video ({total_chars} chars)")
    if total_chars > 2100:
        warnings.append(f"script may be long for a 5 minute video ({total_chars} chars)")
    if not 18 <= len(scenes) <= 30:
        warnings.append(f"scene count is outside the preferred 18-30 range ({len(scenes)})")
    return {"errors": errors, "warnings": warnings}
