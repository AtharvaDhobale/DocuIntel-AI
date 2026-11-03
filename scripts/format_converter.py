#!/usr/bin/env python3
"""
CLI Format Converter: Ingests HTML or plain text documentation and converts
it into topic-based Markdown with standardized YAML frontmatter.
"""

import sys
import re
import argparse
from pathlib import Path

def convert_to_topic_markdown(text: str, title: str) -> str:
    slug = re.sub(r"[^\w\-]", "-", title.lower()).strip("-")
    
    # Strip basic HTML tags if input is HTML
    clean_text = re.sub(r"<h1[^>]*>(.*?)</h1>", r"# \1\n", text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<h2[^>]*>(.*?)</h2>", r"## \1\n", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<h3[^>]*>(.*?)</h3>", r"### \1\n", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<li[^>]*>(.*?)</li>", r"- \1", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<p[^>]*>(.*?)</p>", r"\1\n\n", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<[^>]+>", "", clean_text)
    
    # Clean whitespace
    clean_text = re.sub(r"\n{3,}", "\n\n", clean_text).strip()

    frontmatter = f"""---
id: {slug}
title: {title}
sidebar_label: {title}
description: Automatically converted topic-based documentation for {title}.
tags: [converted, docs-as-code]
---

"""
    return frontmatter + clean_text + "\n"

def main():
    parser = argparse.ArgumentParser(description="Convert legacy HTML or raw text to topic-based markdown.")
    parser.add_argument("input_file", help="Path to input text or html file")
    parser.add_argument("--title", default="Imported Topic", help="Topic title")
    parser.add_argument("--output", help="Path to output markdown file")
    args = parser.parse_args()

    in_path = Path(args.input_file)
    if not in_path.exists():
        print(f"[ERROR] Input file {in_path} does not exist.")
        sys.exit(1)

    raw = in_path.read_text(encoding="utf-8", errors="ignore")
    md = convert_to_topic_markdown(raw, args.title)

    out_path = Path(args.output) if args.output else in_path.with_suffix(".md")
    out_path.write_text(md, encoding="utf-8")
    print(f"[SUCCESS] Converted {in_path} -> {out_path}")

if __name__ == "__main__":
    main()
