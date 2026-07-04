from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .draft_parser import parse_draft
from .script_generator import generate_script, generate_script_with_claude
from .timeline import build_audio_and_timeline
from .validate import validate_script


ROOT = Path(__file__).resolve().parents[1]


def _write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def cmd_parse(args: argparse.Namespace) -> int:
    draft = parse_draft(Path(args.draft))
    _write_json(Path(args.out), draft)
    print(f"wrote {args.out}")
    return 0


def cmd_script(args: argparse.Namespace) -> int:
    draft = _read_json(Path(args.draft_json))
    if args.method == "claude":
        script = generate_script_with_claude(draft, Path(args.prompt), target_sec=args.target_sec)
    else:
        script = generate_script(draft, target_sec=args.target_sec)
    report = validate_script(script)
    script.setdefault("review", {})["validation"] = report
    _write_json(Path(args.out), script)
    if report["errors"]:
        print("script generated with validation errors:", file=sys.stderr)
        for err in report["errors"]:
            print(f"- {err}", file=sys.stderr)
        return 2
    print(f"wrote {args.out}")
    if report["warnings"]:
        print("warnings:")
        for warning in report["warnings"]:
            print(f"- {warning}")
    return 0


def cmd_validate(args: argparse.Namespace) -> int:
    script = _read_json(Path(args.script_json))
    report = validate_script(script)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not report["errors"] else 2


def cmd_audio(args: argparse.Namespace) -> int:
    script = _read_json(Path(args.script_json))
    result = build_audio_and_timeline(
        script=script,
        build_dir=Path(args.build_dir),
        pacing_path=Path(args.pacing),
        speakers_path=Path(args.speakers),
        pronunciation_path=Path(args.pronunciation),
        voicevox_url=args.voicevox_url,
        mode=args.mode,
        fps=args.fps,
    )
    print(f"wrote {result['timeline']}")
    print(f"wrote {result['narration']}")
    if result["warnings"]:
        print("warnings:")
        for warning in result["warnings"]:
            print(f"- {warning}")
    return 0


def cmd_build(args: argparse.Namespace) -> int:
    build_dir = Path(args.build_dir)
    draft_json = build_dir / "draft.json"
    script_json = build_dir / "script.json"
    cmd_parse(argparse.Namespace(draft=args.draft, out=str(draft_json)))
    script_code = cmd_script(
        argparse.Namespace(
            draft_json=str(draft_json),
            out=str(script_json),
            target_sec=args.target_sec,
            method=args.method,
            prompt=args.prompt,
        )
    )
    if script_code not in (0,):
        return script_code
    return cmd_audio(
        argparse.Namespace(
            script_json=str(script_json),
            build_dir=str(build_dir),
            pacing=args.pacing,
            speakers=args.speakers,
            pronunciation=args.pronunciation,
            voicevox_url=args.voicevox_url,
            mode=args.mode,
            fps=args.fps,
        )
    )


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Health education movie generation pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    parse_cmd = sub.add_parser("parse", help="parse a health draft markdown into draft.json")
    parse_cmd.add_argument("draft")
    parse_cmd.add_argument("-o", "--out", required=True)
    parse_cmd.set_defaults(func=cmd_parse)

    script_cmd = sub.add_parser("script", help="generate a reviewable script.json from draft.json")
    script_cmd.add_argument("draft_json")
    script_cmd.add_argument("-o", "--out", required=True)
    script_cmd.add_argument("--target-sec", type=float, default=300)
    script_cmd.add_argument("--method", choices=["heuristic", "claude"], default="heuristic")
    script_cmd.add_argument("--prompt", default=str(ROOT / "prompts" / "scenario.md"))
    script_cmd.set_defaults(func=cmd_script)

    validate_cmd = sub.add_parser("validate", help="validate script.json")
    validate_cmd.add_argument("script_json")
    validate_cmd.set_defaults(func=cmd_validate)

    audio_cmd = sub.add_parser("audio", help="build audio_query files, wav files, narration.wav, and timeline.json")
    audio_cmd.add_argument("script_json")
    audio_cmd.add_argument("--build-dir", required=True)
    audio_cmd.add_argument("--pacing", default=str(ROOT / "config" / "pacing.json"))
    audio_cmd.add_argument("--speakers", default=str(ROOT / "config" / "speakers.json"))
    audio_cmd.add_argument("--pronunciation", default=str(ROOT / "config" / "pronunciation.json"))
    audio_cmd.add_argument("--voicevox-url", default="http://127.0.0.1:50021")
    audio_cmd.add_argument("--mode", choices=["auto", "voicevox", "dry-run"], default="auto")
    audio_cmd.add_argument("--fps", type=int, default=30)
    audio_cmd.set_defaults(func=cmd_audio)

    build_cmd = sub.add_parser("build", help="parse, generate script, and build dry-run or VOICEVOX timeline")
    build_cmd.add_argument("draft")
    build_cmd.add_argument("--build-dir", required=True)
    build_cmd.add_argument("--pacing", default=str(ROOT / "config" / "pacing.json"))
    build_cmd.add_argument("--speakers", default=str(ROOT / "config" / "speakers.json"))
    build_cmd.add_argument("--pronunciation", default=str(ROOT / "config" / "pronunciation.json"))
    build_cmd.add_argument("--voicevox-url", default="http://127.0.0.1:50021")
    build_cmd.add_argument("--mode", choices=["auto", "voicevox", "dry-run"], default="auto")
    build_cmd.add_argument("--fps", type=int, default=30)
    build_cmd.add_argument("--target-sec", type=float, default=300)
    build_cmd.add_argument("--method", choices=["heuristic", "claude"], default="heuristic")
    build_cmd.add_argument("--prompt", default=str(ROOT / "prompts" / "scenario.md"))
    build_cmd.set_defaults(func=cmd_build)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    return args.func(args)
