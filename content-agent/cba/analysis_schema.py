"""The analysis.json contract and its validator.

analysis.json is the single creative/analytical decision file of a job. It is
written either by Claude working in the project (agent mode) or by the Claude
API (api mode), and every later stage (edit, subtitles, cover, copy, KB) is a
deterministic function of it. Editing it by hand and re-running regenerates
everything downstream.
"""
from __future__ import annotations

VIDEO_TYPES = {
    "A_match": "比赛录像", "B_tutorial": "技术教学", "C_training": "训练片段",
    "D_student_training": "学员训练", "E_student_match": "学员比赛分析",
    "F_personal_training": "个人训练", "G_knowledge": "羽毛球知识分享",
    "H_vlog": "日常 Vlog", "I_other": "其他",
}
BASIS = {"observed", "inferred", "not_visible"}
CONFIDENCE = {"low", "medium", "high"}
KB_STATUS = {"observed", "hypothesis"}  # a single video can never produce repeated_pattern/confirmed
KB_MODULES = {"technical_profile", "playing_style", "coaching_philosophy", "content_style"}

TEMPLATE = {
    "schema_version": 1,
    "analyst": "claude (agent mode) | claude-opus-5-5 (api mode)",
    "video_types": ["A_match"],
    "type_reasoning": "why these labels; cite timestamps",
    "summary": {"zh": "", "en": ""},
    "subject": {"who_is_colin": "how Colin is identified on screen, or 'unknown'", "confidence": "medium"},
    "people_and_privacy": {
        "other_people_visible": True,
        "possible_minors": False,
        "names_or_contacts_visible": False,
        "private_location_risk": False,
        "notes": "",
    },
    "camera_and_limits": ["single fixed camera behind the court; far-side feet often hidden"],
    "key_moments": [{
        "start": 0.0, "end": 0.0, "kind": "rally|winner|error|technique_demo|teaching_point|turning_point|reaction",
        "title": {"zh": "", "en": ""}, "what_happens": "only what is visible",
        "importance": 3, "uses": ["long", "short"], "short_suitable": True,
    }],
    "technical_observations": [{
        "dimension": "footwork.recovery", "observation": "", "timestamps": [0.0],
        "basis": "observed|inferred|not_visible", "confidence": "low|medium|high",
        "visibility_limits": "",
    }],
    "stats": {"source": "auto|manual_observation|human_verified", "items": []},
    "content_value": {"best_for": [], "beginner_value": "", "advanced_value": "", "split_topics": []},
    "edit_plan": {
        "long": {"make": True, "segments": [{"start": 0.0, "end": 0.0, "speed": 1.0, "label": ""}]},
        "short": {"make": True, "aspect": "9:16", "crop_x_center": 0.5,
                  "segments": [{"start": 0.0, "end": 0.0, "speed": 1.0, "label": ""}]},
        "rationale": "",
    },
    "subtitles": [{"start": 0.0, "end": 0.0, "zh": "", "en": "", "source": "speech|caption"}],
    "thumbnail": {"time": 0.0, "text": {"zh": "", "en": ""}, "reason": ""},
    "copy": {
        "youtube": {"title_en": "", "title_zh": "", "description": "", "tags": [], "chapters": [], "language": "zh"},
        "shorts": {"title": "", "description": "", "tags": []},
        "xiaohongshu": {"title": "", "body": "", "tags": []},
        "website": {"section": "highlights|training", "category": "tournaments|matches|training",
                    "title": "", "description": "", "seo_title": "", "seo_description": ""},
    },
    "kb_updates": [{
        "module": "technical_profile", "dimension": "footwork.recovery", "claim": "",
        "status": "observed|hypothesis", "confidence": "low|medium|high",
        "evidence": [{"start": 0.0, "end": 0.0, "observation": ""}],
        "counter_evidence": "",
    }],
    "needs_colin": ["questions only Colin can answer (opponent name, event, date...)"],
}


def validate(a: dict, duration: float) -> list[str]:
    errs: list[str] = []

    def t_ok(t, where):
        if not isinstance(t, (int, float)) or t < 0 or t > duration + 0.5:
            errs.append(f"{where}: time {t!r} outside 0..{duration}")

    for k in ("video_types", "summary", "key_moments", "technical_observations", "edit_plan",
              "thumbnail", "copy", "kb_updates", "people_and_privacy", "camera_and_limits"):
        if k not in a:
            errs.append(f"missing key: {k}")
    if errs:
        return errs
    for v in a["video_types"]:
        if v not in VIDEO_TYPES:
            errs.append(f"unknown video type {v}")
    for i, m in enumerate(a["key_moments"]):
        t_ok(m.get("start"), f"key_moments[{i}].start")
        t_ok(m.get("end"), f"key_moments[{i}].end")
        if m.get("end", 0) <= m.get("start", 0):
            errs.append(f"key_moments[{i}] end <= start")
    for i, o in enumerate(a["technical_observations"]):
        if o.get("basis") not in BASIS:
            errs.append(f"technical_observations[{i}].basis must be one of {sorted(BASIS)}")
        if o.get("confidence") not in CONFIDENCE:
            errs.append(f"technical_observations[{i}].confidence invalid")
        if o.get("basis") == "observed" and not o.get("timestamps"):
            errs.append(f"technical_observations[{i}] is 'observed' but has no timestamps")
        for t in o.get("timestamps", []):
            t_ok(t, f"technical_observations[{i}].timestamps")
    for part in ("long", "short"):
        p = a["edit_plan"].get(part, {})
        if p.get("make"):
            if not p.get("segments"):
                errs.append(f"edit_plan.{part} has no segments")
            for j, s in enumerate(p.get("segments", [])):
                t_ok(s.get("start"), f"edit_plan.{part}[{j}].start")
                t_ok(s.get("end"), f"edit_plan.{part}[{j}].end")
                if s.get("end", 0) <= s.get("start", 0):
                    errs.append(f"edit_plan.{part}[{j}] end <= start")
                if not 0.25 <= float(s.get("speed", 1)) <= 1.0:
                    errs.append(f"edit_plan.{part}[{j}].speed must be 0.25..1.0 (no speed-ups of action)")
    t_ok(a["thumbnail"].get("time"), "thumbnail.time")
    for i, s in enumerate(a.get("subtitles", [])):
        t_ok(s.get("start"), f"subtitles[{i}].start")
        if not s.get("zh") or not s.get("en"):
            errs.append(f"subtitles[{i}] needs both zh and en")
    for i, u in enumerate(a["kb_updates"]):
        if u.get("module") not in KB_MODULES:
            errs.append(f"kb_updates[{i}].module invalid")
        if u.get("status") not in KB_STATUS:
            errs.append(f"kb_updates[{i}].status must be observed|hypothesis from a single video")
        if not u.get("evidence"):
            errs.append(f"kb_updates[{i}] has no evidence")
        for e in u.get("evidence", []):
            t_ok(e.get("start"), f"kb_updates[{i}].evidence.start")
    return errs
