"""Stage 12: per-platform copy files (titles, descriptions, tags, chapters).

Chapters are given in source time in analysis.json and re-timed onto the long
cut here. Honours mentioned in copy are checked against knowledge/public_facts.yaml.
"""
from __future__ import annotations

import re

import yaml

from .. import config, media


def _retime(t, tl):
    for seg in tl:
        if seg["speed"] == 1.0 and seg["src_start"] <= t <= seg["src_end"]:
            return seg["out_start"] + (t - seg["src_start"])
    return None


def _claims_check(texts: list[str]) -> list[str]:
    """Flag honour-like phrases not present in public facts (human review)."""
    facts = (config.KNOWLEDGE_DIR / "public_facts.yaml").read_text("utf-8").lower()
    flags = []
    pat = re.compile(r"(champion|冠军|national team|国家队|olympic|奥运|world|世界|ranked|排名|mvp|player of the year)",
                     re.I)
    for t in texts:
        for m in pat.finditer(t or ""):
            sentence = t[max(0, m.start() - 40): m.end() + 40].replace("\n", " ")
            key = m.group(1).lower()
            if key not in facts:
                flags.append(f"'{m.group(1)}' not found in public_facts.yaml: …{sentence}…")
    return flags


def run(job):
    a = job.read_json("analysis.json")
    dec = job.read_json("edit_decisions.json")
    c = a["copy"]
    yt = dict(c["youtube"])
    if "long" in dec["outputs"] and yt.get("chapters"):
        tl = dec["outputs"]["long"]["timeline"]
        ch = []
        for item in yt["chapters"]:
            t, label = (item[0], item[1]) if isinstance(item, list) else (item["time"], item["label"])
            ot = _retime(float(t), tl)
            if ot is not None:
                ch.append((ot, label))
        ch.sort()
        if ch and ch[0][0] > 0:
            ch[0] = (0.0, ch[0][1])  # YouTube requires the first chapter at 0:00
        yt["chapters_text"] = "\n".join(f"{media.mmss(t)} {l}" for t, l in ch) if len(ch) >= 3 else ""
    title = f"{yt.get('title_zh', '')} | {yt.get('title_en', '')}".strip(" |")[:100]
    desc = yt.get("description", "")
    if yt.get("chapters_text"):
        desc += "\n\n" + yt["chapters_text"]
    desc += f"\n\n🌐 {config.SITE_URL}"
    youtube = {"title": title, "description": desc[:5000], "tags": yt.get("tags", [])[:30],
               "categoryId": "17", "defaultLanguage": yt.get("language", "zh"),
               "defaultAudioLanguage": yt.get("language", "zh")}
    shorts = dict(c["shorts"])
    shorts["title"] = (shorts.get("title", "")[:90] + (" #Shorts" if "#shorts" not in shorts.get("title", "").lower()
                                                       else "")).strip()
    shorts["description"] = shorts.get("description", "") + f"\n\n{config.SITE_URL}"
    xhs = c["xiaohongshu"]
    site = c["website"]
    platform = {"youtube": youtube, "shorts": shorts, "xiaohongshu": xhs, "website": site}
    job.write_json("copy.json", platform)
    flags = _claims_check([youtube["title"], youtube["description"], shorts["title"], shorts["description"],
                           xhs.get("title"), xhs.get("body"), site.get("title"), site.get("description")])
    md = [f"# 发布文案 / Publishing copy — {job.id}\n"]
    md += ["## YouTube (long)", f"**Title:** {youtube['title']}", "", "**Description:**", "", youtube["description"],
           "", f"**Tags:** {', '.join(youtube['tags'])}", ""]
    md += ["## YouTube Shorts", f"**Title:** {shorts['title']}", "", shorts["description"],
           "", f"**Tags:** {', '.join(shorts.get('tags', []))}", ""]
    md += ["## 小红书", f"**标题：** {xhs.get('title', '')}", "", xhs.get("body", ""), "",
           " ".join(f"#{t.lstrip('#')}" for t in xhs.get("tags", [])), ""]
    md += ["## colinbadminton.com", f"**Section:** {site.get('section')} / {site.get('category')}",
           f"**Card title:** {site.get('title')}", f"**Card text:** {site.get('description')}",
           f"**SEO title:** {site.get('seo_title')}", f"**SEO description:** {site.get('seo_description')}", ""]
    if flags:
        md += ["## ⚠️ Claims to check before publishing", *[f"- {f}" for f in flags]]
    job.file("copy.md").write_text("\n".join(md), "utf-8")
    job.write_json("copy_flags.json", flags)
    return {"claim_flags": len(flags)}
