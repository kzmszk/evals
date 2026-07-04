from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path


def check_voicevox(base_url: str, timeout: float = 1.0) -> bool:
    try:
        with urllib.request.urlopen(f"{base_url.rstrip('/')}/version", timeout=timeout) as response:
            return response.status == 200
    except (OSError, urllib.error.URLError):
        return False


def audio_query(base_url: str, text: str, speaker: int) -> dict[str, object]:
    params = urllib.parse.urlencode({"text": text, "speaker": speaker})
    request = urllib.request.Request(f"{base_url.rstrip('/')}/audio_query?{params}", method="POST")
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def synthesis(base_url: str, query: dict[str, object], speaker: int) -> bytes:
    params = urllib.parse.urlencode({"speaker": speaker})
    data = json.dumps(query, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/synthesis?{params}",
        data=data,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def sync_user_dictionary(base_url: str, words: list[dict[str, object]]) -> list[str]:
    warnings: list[str] = []
    for word in words:
        params = urllib.parse.urlencode(
            {
                "surface": str(word["surface"]),
                "pronunciation": str(word["pronunciation"]),
                "accent_type": int(word.get("accent_type", 1)),
                "word_type": str(word.get("word_type", "PROPER_NOUN")),
                "priority": int(word.get("priority", 5)),
            }
        )
        request = urllib.request.Request(f"{base_url.rstrip('/')}/user_dict_word?{params}", method="POST")
        try:
            with urllib.request.urlopen(request, timeout=10):
                pass
        except urllib.error.HTTPError as exc:
            if exc.code == 422:
                warnings.append(f"user dictionary word may already exist: {word.get('surface')}")
            else:
                warnings.append(f"user dictionary sync failed for {word.get('surface')}: HTTP {exc.code}")
        except OSError as exc:
            warnings.append(f"user dictionary sync failed for {word.get('surface')}: {exc}")
    return warnings


def apply_speaker_settings(query: dict[str, object], settings: dict[str, object]) -> dict[str, object]:
    query = json.loads(json.dumps(query, ensure_ascii=False))
    for key in ("speedScale", "pitchScale", "intonationScale", "volumeScale", "prePhonemeLength", "postPhonemeLength"):
        if key in settings:
            query[key] = settings[key]
    query["outputSamplingRate"] = int(settings.get("outputSamplingRate", 24000))
    query["outputStereo"] = bool(settings.get("outputStereo", False))
    return query


def synthetic_audio_query(text: str, settings: dict[str, object]) -> dict[str, object]:
    speed = float(settings.get("speedScale", 1.0))
    phrases = []
    current: list[dict[str, object]] = []
    for char in text:
        if char.isspace():
            continue
        if char in "。！？!?、，":
            if current:
                phrases.append({"moras": current, "accent": 1, "pause_mora": {"text": "、", "vowel": "pau", "vowel_length": 0.22 if char in "。！？!?" else 0.12}})
                current = []
            continue
        base = 0.182
        if char in "ゃゅょぁぃぅぇぉっッー":
            base = 0.09
        elif re_is_ascii(char):
            base = 0.09
        current.append({"text": char, "vowel": "a", "vowel_length": base, "consonant": None, "consonant_length": None})
    if current:
        phrases.append({"moras": current, "accent": 1, "pause_mora": None})
    return {
        "accent_phrases": phrases or [{"moras": [{"text": "ん", "vowel": "N", "vowel_length": 0.1, "consonant": None, "consonant_length": None}], "accent": 1, "pause_mora": None}],
        "speedScale": speed,
        "pitchScale": float(settings.get("pitchScale", 0.0)),
        "intonationScale": float(settings.get("intonationScale", 1.0)),
        "volumeScale": float(settings.get("volumeScale", 1.0)),
        "prePhonemeLength": float(settings.get("prePhonemeLength", 0.1)),
        "postPhonemeLength": float(settings.get("postPhonemeLength", 0.1)),
        "kana": text,
    }


def re_is_ascii(char: str) -> bool:
    return ord(char) < 128


def computed_duration(query: dict[str, object]) -> float:
    total = float(query.get("prePhonemeLength", 0.0)) + float(query.get("postPhonemeLength", 0.0))
    for phrase in query.get("accent_phrases", []):
        for mora in phrase.get("moras", []):
            total += float(mora.get("consonant_length") or 0.0)
            total += float(mora.get("vowel_length") or 0.0)
        pause = phrase.get("pause_mora")
        if pause:
            total += float(pause.get("vowel_length") or 0.0)
    speed = float(query.get("speedScale", 1.0)) or 1.0
    return total / speed


def mora_timings(query: dict[str, object]) -> list[dict[str, object]]:
    speed = float(query.get("speedScale", 1.0)) or 1.0
    cursor = float(query.get("prePhonemeLength", 0.0)) / speed
    timings: list[dict[str, object]] = []
    for phrase in query.get("accent_phrases", []):
        for mora in phrase.get("moras", []):
            length = (float(mora.get("consonant_length") or 0.0) + float(mora.get("vowel_length") or 0.0)) / speed
            timings.append({"text": str(mora.get("text") or ""), "startSec": cursor, "endSec": cursor + length})
            cursor += length
        pause = phrase.get("pause_mora")
        if pause:
            cursor += float(pause.get("vowel_length") or 0.0) / speed
    return timings


def write_silence_wav(path: Path, duration_sec: float, sample_rate: int = 24000) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    frames = max(1, int(round(duration_sec * sample_rate)))
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b"\x00\x00" * frames)


def measure_wav(path: Path) -> float:
    with wave.open(str(path), "rb") as wav:
        return wav.getnframes() / float(wav.getframerate())


def concat_wavs(parts: list[Path], out: Path, sample_rate: int = 24000) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as dest:
        dest.setnchannels(1)
        dest.setsampwidth(2)
        dest.setframerate(sample_rate)
        for part in parts:
            with wave.open(str(part), "rb") as src:
                if src.getnchannels() != 1 or src.getsampwidth() != 2:
                    raise ValueError(f"{part} must be mono 16-bit wav")
                if src.getframerate() != sample_rate:
                    raise ValueError(f"{part} has unsupported sample rate {src.getframerate()}")
                dest.writeframes(src.readframes(src.getnframes()))


def write_voicevox_wav(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def write_pause(path: Path, duration_ms: int, sample_rate: int = 24000) -> None:
    write_silence_wav(path, max(0.0, duration_ms / 1000.0), sample_rate)
