from __future__ import annotations

import re


SCENE_TYPES = {"title", "hook", "quiz", "answer", "explain", "myth_bust", "takeaway", "sources"}
HEADLINE_SCENES = {"title", "hook", "explain", "myth_bust", "takeaway", "sources"}


def _count_japanese_chars(value: str) -> int:
    return len(re.sub(r"\s+", "", value))


def _as_list(value: object) -> list[object]:
    return value if isinstance(value, list) else []


def normalize_script(script: dict[str, object]) -> dict[str, object]:
    """Accept known legacy/LLM aliases and rewrite them to the timeline contract."""
    for scene in _as_list(script.get("scenes")):
        if not isinstance(scene, dict):
            continue
        on_screen = scene.setdefault("onScreen", {})
        if not isinstance(on_screen, dict):
            scene["onScreen"] = {}
            on_screen = scene["onScreen"]
        if "headline" not in on_screen:
            for key in ("headline", "title", "heading"):
                if on_screen.get(key):
                    on_screen["headline"] = on_screen[key]
                    break
        if "subhead" not in on_screen:
            for key in ("subhead", "subtitle", "note", "description"):
                if on_screen.get(key):
                    on_screen["subhead"] = on_screen[key]
                    break
        if "items" not in on_screen and isinstance(on_screen.get("points"), list):
            on_screen["items"] = on_screen["points"]
        if "sources" not in on_screen and isinstance(on_screen.get("references"), list):
            on_screen["sources"] = on_screen["references"]
        if scene.get("type") == "answer" and "mark" not in on_screen:
            on_screen["mark"] = "○ / ×"
    return script


def _require_text(scene_id: object, on_screen: dict[str, object], key: str, errors: list[str]) -> None:
    if not str(on_screen.get(key) or "").strip():
        errors.append(f"{scene_id}: onScreen.{key} is required")


def _require_list(scene_id: object, on_screen: dict[str, object], key: str, errors: list[str]) -> None:
    value = on_screen.get(key)
    if not isinstance(value, list) or not value:
        errors.append(f"{scene_id}: onScreen.{key} must be a non-empty list")


def validate_script(script: dict[str, object]) -> dict[str, list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    script = normalize_script(script)
    scenes = script.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        errors.append("scenes must be a non-empty list")
        return {"errors": errors, "warnings": warnings}

    total_chars = 0
    seen_ids: set[str] = set()
    for scene_index, scene in enumerate(scenes):
        if not isinstance(scene, dict):
            errors.append(f"scene {scene_index} is not an object")
            continue
        scene_id = scene.get("id", f"scene[{scene_index}]")
        if str(scene_id) in seen_ids:
            errors.append(f"{scene_id}: duplicate scene id")
        seen_ids.add(str(scene_id))
        scene_type = scene.get("type")
        if scene_type not in SCENE_TYPES:
            errors.append(f"{scene_id}: unknown scene type {scene_type!r}")

        on_screen = scene.get("onScreen", {})
        if not isinstance(on_screen, dict):
            errors.append(f"{scene_id}: onScreen must be an object")
            on_screen = {}
        if scene_type in HEADLINE_SCENES:
            _require_text(scene_id, on_screen, "headline", errors)
        if scene_type == "quiz":
            _require_text(scene_id, on_screen, "question", errors)
            _require_list(scene_id, on_screen, "options", errors)
        if scene_type == "answer":
            _require_text(scene_id, on_screen, "headline", errors)
            _require_text(scene_id, on_screen, "mark", errors)
        if scene_type == "takeaway":
            _require_list(scene_id, on_screen, "items", errors)
        if scene_type == "sources":
            _require_list(scene_id, on_screen, "sources", errors)
        headline = str(on_screen.get("headline") or on_screen.get("question") or "")
        headline_limit = 48 if scene_type == "quiz" else 28
        if _count_japanese_chars(headline) > headline_limit:
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
