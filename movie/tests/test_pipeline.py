from __future__ import annotations

import unittest

import json

from movie_pipeline.script_generator import _extract_json
from movie_pipeline.timeline import _emphasis_timing
from movie_pipeline.validate import normalize_script, validate_script


class ValidateScriptTest(unittest.TestCase):
    def test_normalizes_common_claude_on_screen_aliases(self) -> None:
        script = {
            "scenes": [
                {
                    "id": "takeaway-01",
                    "type": "takeaway",
                    "onScreen": {"title": "まとめ", "points": ["一つ目"]},
                    "utterances": [{"speaker": "teacher", "text": "まとめます。", "emphasis": []}],
                }
            ]
        }
        normalize_script(script)
        self.assertEqual(script["scenes"][0]["onScreen"]["headline"], "まとめ")
        self.assertEqual(script["scenes"][0]["onScreen"]["items"], ["一つ目"])
        self.assertEqual(validate_script(script)["errors"], [])

    def test_requires_scene_type_specific_on_screen_fields(self) -> None:
        script = {
            "scenes": [
                {
                    "id": "sources-01",
                    "type": "sources",
                    "onScreen": {"headline": "主要な出典"},
                    "utterances": [{"speaker": "teacher", "text": "出典です。", "emphasis": []}],
                }
            ]
        }
        self.assertIn("sources-01: onScreen.sources must be a non-empty list", validate_script(script)["errors"])

    def test_duplicate_scene_ids_are_errors(self) -> None:
        scene = {
            "id": "explain-01",
            "type": "explain",
            "onScreen": {"headline": "要点"},
            "utterances": [{"speaker": "teacher", "text": "要点です。", "emphasis": []}],
        }
        errors = validate_script({"scenes": [scene, dict(scene)]})["errors"]
        self.assertIn("explain-01: duplicate scene id", errors)


class ExtractJsonTest(unittest.TestCase):
    def test_valid_json_is_not_mangled_by_fence_stripping(self) -> None:
        # claude -p --output-format json のラッパーは有効なJSONだが、result 内に
        # コードフェンスが含まれると先頭のフェンス抽出がラッパーを壊す(回帰)。
        inner = "```json\n{\n  \"schemaVersion\": 1\n}\n```"
        wrapper = json.dumps({"type": "result", "result": inner})
        parsed = _extract_json(wrapper)
        self.assertEqual(parsed["type"], "result")
        self.assertEqual(_extract_json(str(parsed["result"]))["schemaVersion"], 1)

    def test_fenced_output_is_unwrapped(self) -> None:
        self.assertEqual(_extract_json("前置き\n```json\n{\"a\": 1}\n```")["a"], 1)


class EmphasisTimingTest(unittest.TestCase):
    def test_emphasis_timing_has_readable_floor(self) -> None:
        timings = [
            {"text": "ス", "startSec": 0.0, "endSec": 0.1},
            {"text": "イ", "startSec": 0.1, "endSec": 0.2},
            {"text": "ミ", "startSec": 0.2, "endSec": 0.3},
        ]
        timing = _emphasis_timing("睡眠", "睡眠", 10.0, 12.0, timings)
        self.assertGreaterEqual(timing["endSec"] - timing["startSec"], 1.5)

    def test_missing_emphasis_falls_back_to_utterance_head(self) -> None:
        timing = _emphasis_timing("本文", "別語", 3.0, 9.0, [])
        self.assertEqual(timing["startSec"], 3.0)
        self.assertEqual(timing["endSec"], 5.0)
        self.assertTrue(timing["fallback"])


if __name__ == "__main__":
    unittest.main()
