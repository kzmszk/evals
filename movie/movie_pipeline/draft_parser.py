from __future__ import annotations

import re
from pathlib import Path


HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
EVIDENCE_RE = re.compile(r"【エビデンス強度\s*([A-D])[:：]?\s*([^】]*)】")
OPTION_RE = re.compile(r"^\s*[-*]\s+\*\*([A-Z])\.\*\*\s*(.+?)\s*$")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")

SEMANTIC = {
    "フック": "hook",
    "クイズ": "quiz",
    "正解": "answer",
    "解説": "explain",
    "ぶった斬りコーナー": "myth_bust",
    "選択肢の答え合わせ": "answer_key",
    "今日から使える結論": "takeaways",
    "主要な出典": "sources",
}


def _slugify(value: str, fallback: str) -> str:
    asciiish = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-").lower()
    return asciiish or fallback


def _semantic_type(heading: str) -> str:
    clean = re.sub(r"\s+", "", heading)
    for key, value in SEMANTIC.items():
        if re.sub(r"\s+", "", key) == clean:
            return value
    return "section"


def _strip_markdown(value: str) -> str:
    value = re.sub(r"\*\*(.+?)\*\*", r"\1", value)
    value = re.sub(r"`(.+?)`", r"\1", value)
    return value.strip()


def _extract_quiz(text: str) -> dict[str, object]:
    question = ""
    options: list[dict[str, str]] = []
    for line in text.splitlines():
        if not question and "Q." in line:
            question = _strip_markdown(line).replace("Q.", "").strip()
        match = OPTION_RE.match(line)
        if match:
            options.append({"label": match.group(1), "text": _strip_markdown(match.group(2))})
    return {"question": question, "options": options}


def _extract_takeaways(text: str) -> list[str]:
    items: list[str] = []
    for line in text.splitlines():
        match = re.match(r"^\s*\d+\.\s+(.+?)\s*$", line)
        if match:
            items.append(_strip_markdown(match.group(1)))
    return items


def _extract_numbered(text: str) -> list[str]:
    items: list[str] = []
    for line in text.splitlines():
        match = re.match(r"^\s*\d+\.\s+(.+?)\s*$", line)
        if match:
            items.append(_strip_markdown(match.group(1)))
    return items


def _extract_sources(text: str) -> list[str]:
    sources: list[str] = []
    for line in text.splitlines():
        if re.match(r"^\s*[-*]\s+", line):
            sources.append(_strip_markdown(re.sub(r"^\s*[-*]\s+", "", line)))
    return sources


def _extract_bullets(text: str) -> list[str]:
    bullets: list[str] = []
    for line in text.splitlines():
        if re.match(r"^\s*[-*]\s+", line):
            bullets.append(_strip_markdown(re.sub(r"^\s*[-*]\s+", "", line)))
    return bullets


def _finalize_section(raw: dict[str, object]) -> dict[str, object]:
    text = "\n".join(raw.pop("_lines")).strip()
    section = {**raw, "text": text}
    section["evidence"] = [
        {"level": level, "note": note.strip(), "raw": f"【エビデンス強度 {level}: {note.strip()}】"}
        for level, note in EVIDENCE_RE.findall(text)
    ]
    section["bold"] = [_strip_markdown(value) for value in BOLD_RE.findall(text)]
    section["bullets"] = _extract_bullets(text)
    section["numbered"] = _extract_numbered(text)
    if section["type"] == "quiz":
        section["quiz"] = _extract_quiz(text)
    if section["type"] == "takeaways":
        section["takeaways"] = _extract_takeaways(text)
    if section["type"] == "sources":
        section["sources"] = _extract_sources(text)
    return section


def parse_draft(path: Path) -> dict[str, object]:
    markdown = path.read_text(encoding="utf-8")
    title = path.stem
    preface: list[str] = []
    sections: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    counters: dict[str, int] = {}

    for line in markdown.splitlines():
        match = HEADING_RE.match(line)
        if match:
            level = len(match.group(1))
            heading = _strip_markdown(match.group(2))
            if level == 1:
                title = heading
                continue
            if current is not None:
                sections.append(_finalize_section(current))
            section_type = _semantic_type(heading)
            counters[section_type] = counters.get(section_type, 0) + 1
            current = {
                "id": f"{section_type}-{counters[section_type]:02d}",
                "heading": heading,
                "level": level,
                "type": section_type,
                "_lines": [],
            }
            continue
        if current is None:
            preface.append(line)
        else:
            current["_lines"].append(line)

    if current is not None:
        sections.append(_finalize_section(current))

    return {
        "meta": {
            "title": title,
            "slug": _slugify(path.stem, "health-video"),
            "source": str(path),
            "domain": "health",
        },
        "preface": "\n".join(preface).strip(),
        "sections": sections,
    }
