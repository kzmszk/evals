from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


EVIDENCE_BADGE = {
    "A": "強度A / 統制実験",
    "B": "強度B / 実験・レビュー",
    "C": "強度C / 観察研究",
    "D": "強度D / 仮説",
}


def _plain(value: str) -> str:
    value = re.sub(r"【エビデンス強度\s*[A-D][^】]*】", "", value)
    value = re.sub(r"\*\*(.+?)\*\*", r"\1", value)
    value = re.sub(r"\(([^)]{35,})\)", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def _sentences(text: str) -> list[str]:
    text = _plain(text)
    parts = re.split(r"(?<=[。！？?])\s*", text)
    return [p.strip() for p in parts if len(p.strip()) > 3]


def _clip(value: str, limit: int = 52) -> str:
    value = _plain(value)
    return value if len(value) <= limit else value[: limit - 1] + "…"


def _headline(section: dict[str, object], fallback: str) -> str:
    bold = section.get("bold") or []
    if isinstance(bold, list) and bold:
        return _clip(str(bold[0]), 28)
    return _clip(str(section.get("heading") or fallback), 28)


def _emphasis(section: dict[str, object]) -> list[str]:
    values = []
    for value in section.get("bold", []):
        text = _plain(str(value))
        if 2 <= len(text) <= 24:
            values.append(text)
    heading = _plain(str(section.get("heading", "")))
    if 2 <= len(heading) <= 24:
        values.append(heading)
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            out.append(value)
    return out[:3]


def _contained_emphasis(section: dict[str, object], text: str) -> list[str]:
    return [value for value in _emphasis(section) if value in text][:2]


def _bold_or_heading(section: dict[str, object], index: int) -> str:
    bold = section.get("bold") or []
    if isinstance(bold, list) and index < len(bold):
        return _clip(str(bold[index]), 28)
    return _clip(str(section.get("heading", "")), 28)


def _find_sections(draft: dict[str, object], section_type: str) -> list[dict[str, object]]:
    return [s for s in draft.get("sections", []) if s.get("type") == section_type]


def _speaker_line(speaker: str, text: str, emphasis: list[str] | None = None, **extra: object) -> dict[str, object]:
    item: dict[str, object] = {"speaker": speaker, "text": _plain(text), "emphasis": emphasis or []}
    item.update(extra)
    return item


def _first_existing(*values: str) -> str:
    for value in values:
        if value:
            return value
    return ""


def generate_script(draft: dict[str, object], target_sec: float = 300) -> dict[str, object]:
    meta = draft.get("meta", {})
    title = str(meta.get("title") or "健康教育動画")
    title_short = title.split("—", 1)[0].strip()
    scenes: list[dict[str, object]] = []

    scenes.append(
        {
            "id": "title-01",
            "type": "title",
            "sourceSections": [],
            "onScreen": {"headline": title_short, "subhead": "楽しく、気楽に、しっかり学ぶ健康講座"},
            "utterances": [
                _speaker_line("teacher", f"今日のテーマは、{title_short}です。"),
                _speaker_line("student", "気になるけど、ちゃんと知る機会が少ないやつですね。"),
            ],
        }
    )

    hook_sections = _find_sections(draft, "hook")
    if hook_sections:
        hook = hook_sections[0]
        sentences = _sentences(str(hook.get("text", "")))
        scenes.append(
            {
                "id": "hook-01",
                "type": "hook",
                "sourceSections": [hook["id"]],
                "onScreen": {
                    "headline": _headline(hook, "今日の俗説"),
                    "subhead": _clip(_first_existing(sentences[0] if sentences else "", str(hook.get("heading", ""))), 46),
                },
                "utterances": [
                    _speaker_line("student", _first_existing(sentences[0] if sentences else "", "これ、みんなやっていませんか。")),
                    _speaker_line(
                        "teacher",
                        _first_existing(sentences[1] if len(sentences) > 1 else "", "今日はその思い込みを、データでぶった斬ります。"),
                        _contained_emphasis(hook, _first_existing(sentences[1] if len(sentences) > 1 else "", "今日はその思い込みを、データでぶった斬ります。")),
                    ),
                ],
            }
        )

    quiz_sections = _find_sections(draft, "quiz")
    if quiz_sections:
        quiz = quiz_sections[0]
        quiz_data = quiz.get("quiz", {})
        options = [f"{o['label']}. {o['text']}" for o in quiz_data.get("options", [])]
        scenes.append(
            {
                "id": "quiz-01",
                "type": "quiz",
                "sourceSections": [quiz["id"]],
                "onScreen": {
                    "question": str(quiz_data.get("question") or "正しいものを選んでください。"),
                    "options": options,
                },
                "utterances": [
                    _speaker_line("teacher", "ここでクイズです。正しいものを、すべて選んでください。"),
                    _speaker_line("student", "全部それっぽいですね。ひっかけも混ざっていそうです。", pause_after_ms=3000, intent="quiz_think"),
                ],
            }
        )

    answer_sections = _find_sections(draft, "answer")
    if answer_sections:
        answer = answer_sections[0]
        sentences = _sentences(str(answer.get("text", "")))
        scenes.append(
            {
                "id": "answer-01",
                "type": "answer",
                "sourceSections": [answer["id"]],
                "onScreen": {"headline": _clip(sentences[0] if sentences else "正解発表", 28), "mark": "○ / ×"},
                "utterances": [
                    _speaker_line("teacher", _first_existing(sentences[0] if sentences else "", "正解はこちらです。"), pause_after_ms=550, intent="before_answer"),
                    _speaker_line("student", "なるほど。ここから理由を知りたいです。"),
                ],
            }
        )

    explain_sections = _find_sections(draft, "section")
    if not explain_sections:
        explain_sections = _find_sections(draft, "explain")
    explain_count = 0
    for section in explain_sections[:8]:
        sentences = _sentences(str(section.get("text", "")))
        evidence = section.get("evidence", [])
        badge = ""
        if evidence:
            level = str(evidence[0].get("level", ""))
            badge = EVIDENCE_BADGE.get(level, f"強度{level}")
        numbered = [str(item) for item in section.get("numbered", []) or []]
        if numbered:
            intro = _first_existing(sentences[0] if sentences else "", f"{section.get('heading')}を見ていきます。")
            chunks = [[intro, numbered[0]], [_clip("。".join(numbered[1:3]), 96), numbered[3] if len(numbered) > 3 else "毎日の設定を少しだけ上げるのが現実的です。"]]
        else:
            chunks = [sentences[i : i + 2] for i in range(0, min(len(sentences), 6), 2)] or [[]]
        for chunk_index, chunk in enumerate(chunks[:2]):
            explain_count += 1
            teacher_text = _first_existing(chunk[0] if chunk else "", f"{section.get('heading')}を見ていきます。")
            student_text = _first_existing(chunk[1] if len(chunk) > 1 else "", "え、それは体感とズレますね。")
            scenes.append(
                {
                    "id": f"explain-{explain_count:02d}",
                    "type": "explain",
                    "sourceSections": [section["id"]],
                    "evidence": evidence,
                    "onScreen": {
                        "headline": _bold_or_heading(section, chunk_index),
                        "subhead": _clip(student_text, 52),
                        "badge": badge,
                    },
                    "utterances": [
                        _speaker_line("teacher", teacher_text, _contained_emphasis(section, teacher_text)),
                        _speaker_line("student", student_text),
                    ],
                }
            )

    answer_key_sections = _find_sections(draft, "answer_key")
    if answer_key_sections:
        section = answer_key_sections[0]
        bullets = section.get("bullets") or []
        for chunk_index in range(0, min(len(bullets), 6), 3):
            group = [str(item) for item in bullets[chunk_index : chunk_index + 3]]
            if not group:
                continue
            scenes.append(
                {
                    "id": f"answer-key-{chunk_index // 3 + 1:02d}",
                    "type": "explain",
                    "sourceSections": [section["id"]],
                    "onScreen": {
                        "headline": f"答え合わせ {chunk_index + 1}-{chunk_index + len(group)}",
                        "subhead": _clip(" / ".join(_plain(item).split("—", 1)[0] for item in group), 52),
                        "badge": "誤解ポイント整理",
                    },
                    "utterances": [
                        _speaker_line("teacher", _clip(_plain(group[0]), 86)),
                        _speaker_line("student", _clip(_plain(group[1]) if len(group) > 1 else "選択肢ごとの理由が見えると覚えやすいですね。", 70)),
                    ],
                }
            )

    myth_sections = _find_sections(draft, "myth_bust")
    for idx, section in enumerate(myth_sections[:1], start=1):
        bullets = section.get("bullets") or []
        for bullet_idx, bullet in enumerate(bullets[:2], start=1):
            clean = _plain(str(bullet))
            myth, _, correction = clean.partition("—")
            scenes.append(
                {
                    "id": f"myth-{idx:02d}-{bullet_idx:02d}",
                    "type": "myth_bust",
                    "sourceSections": [section["id"]],
                    "onScreen": {"headline": _clip(myth, 28), "subhead": _clip(correction or clean, 56)},
                    "utterances": [
                        _speaker_line("student", f"{_clip(myth, 32)}って聞いたことあります。"),
                        _speaker_line("teacher", _clip(correction or clean, 88), [], intent="myth_bust"),
                    ],
                }
            )

    takeaway_sections = _find_sections(draft, "takeaways")
    if takeaway_sections:
        section = takeaway_sections[0]
        takeaways = section.get("takeaways") or [b for b in section.get("bullets", [])]
        scenes.append(
            {
                "id": "takeaway-01",
                "type": "takeaway",
                "sourceSections": [section["id"]],
                "onScreen": {"headline": "今日から使える結論", "items": takeaways[:3]},
                "utterances": [
                    _speaker_line("teacher", "最後に、今日から使える結論を三つにまとめます。"),
                    _speaker_line("student", "一つ目。" + _clip(str(takeaways[0]), 50) if takeaways else "まずは一つ、持ち帰ります。"),
                    _speaker_line("teacher", _clip("。".join(str(t) for t in takeaways[1:3]), 96) if len(takeaways) > 1 else "小さく続けられる形にしましょう。"),
                ],
            }
        )

    source_sections = _find_sections(draft, "sources")
    if source_sections:
        section = source_sections[0]
        scenes.append(
            {
                "id": "sources-01",
                "type": "sources",
                "sourceSections": [section["id"]],
                "onScreen": {"headline": "主要な出典", "sources": section.get("sources", [])[:5]},
                "utterances": [
                    _speaker_line("teacher", "出典は画面と概要欄にまとめます。健康情報は、強さを分けて受け取るのが大事です。")
                ],
            }
        )

    return {
        "schemaVersion": 1,
        "meta": {
            "title": title_short,
            "sourceTitle": title,
            "slug": meta.get("slug", "health-video"),
            "targetSec": target_sec,
            "accentColor": "#5CD6A4",
            "safety": [
                "ドラフトにない断定を足さない",
                "観察研究とRCTを同じ強さに見せない",
                "個別疾患の治療判断に見える表現を避ける",
            ],
        },
        "speakers": {
            "teacher": {"label": "講師", "persona": "要点を締める落ち着いた案内役"},
            "student": {"label": "生徒", "persona": "視聴者代表の素朴な疑問役"},
        },
        "scenes": scenes,
    }


def _extract_json(value: str) -> dict[str, object]:
    value = value.strip()
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        fence = re.search(r"```(?:json)?\s*(.*?)\s*```", value, flags=re.DOTALL)
        if fence:
            value = fence.group(1).strip()
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            start = value.find("{")
            end = value.rfind("}")
            if start < 0 or end <= start:
                raise
            parsed = json.loads(value[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("Claude output JSON must be an object")
    return parsed


def generate_script_with_claude(draft: dict[str, object], prompt_path: Path, target_sec: float = 300, feedback: str | None = None) -> dict[str, object]:
    prompt = prompt_path.read_text(encoding="utf-8")
    payload = json.dumps(draft, ensure_ascii=False)
    feedback_text = f"\n\n修正指示:\n{feedback}" if feedback else ""
    completed = subprocess.run(
        ["claude", "-p", f"{prompt}{feedback_text}\n\n入力 draft.json:\n{payload}", "--output-format", "json"],
        check=True,
        text=True,
        capture_output=True,
    )
    raw = _extract_json(completed.stdout)
    if isinstance(raw, dict) and "result" in raw and isinstance(raw["result"], str):
        script = _extract_json(raw["result"])
    else:
        script = raw
    script.setdefault("meta", {})["targetSec"] = target_sec
    return script
