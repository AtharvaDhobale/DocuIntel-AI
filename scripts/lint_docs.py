#!/usr/bin/env python3
"""
CLI Documentation Linter for Git CI/CD Publishing Pipelines.
Usage:
    python scripts/lint_docs.py docs/
    python scripts/lint_docs.py docs/my_topic.md --autofix
"""

import sys
import os
import argparse
from pathlib import Path

# Safe UTF-8 console output for Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Add backend to path to import docs_linter
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from docs_linter import DocsLinter

def lint_file(file_path: Path, autofix: bool = False) -> int:
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"[ERROR] Failed to read {file_path}: {e}")
        return 1

    result = DocsLinter.lint_markdown(content)
    stats = result["stats"]

    print(f"\n--- Checking: {file_path} ---")
    print(f"Score: {result['quality_score']}/100 | Status: {result['status']}")
    print(f"Errors: {stats['errors']} | Warnings: {stats['warnings']} | Info: {stats['info']}")

    if result["issues"]:
        for issue in result["issues"]:
            lvl = issue["severity"].upper()
            print(f"  Line {issue['line']} [{lvl}] {issue['type']}: {issue['message']}")
            if issue.get("suggestion"):
                print(f"    --> Suggestion: {issue['suggestion']}")

    if autofix and result["issues"]:
        fixed = DocsLinter.autofix_content(content)
        file_path.write_text(fixed, encoding="utf-8")
        print(f"  [AUTOFIXED] Applied terminology and voice corrections to {file_path}")

    return 1 if stats["errors"] > 0 else 0

def main():
    parser = argparse.ArgumentParser(description="Lint markdown documentation against enterprise style guides.")
    parser.add_argument("target", help="Path to markdown file or directory to lint")
    parser.add_argument("--autofix", action="store_true", help="Automatically apply terminology fixes")
    args = parser.parse_args()

    target_path = Path(args.target)
    if not target_path.exists():
        print(f"[ERROR] Target path '{target_path}' does not exist.")
        sys.exit(1)

    total_failures = 0
    if target_path.is_file():
        total_failures += lint_file(target_path, args.autofix)
    else:
        md_files = list(target_path.glob("**/*.md"))
        if not md_files:
            print(f"No .md files found in {target_path}")
            sys.exit(0)
        print(f"Found {len(md_files)} documentation files in {target_path}...")
        for f in md_files:
            total_failures += lint_file(f, args.autofix)

    if total_failures > 0:
        print(f"\n[FAIL] Linting failed for {total_failures} file(s). Fix errors before merging to publishing pipeline.")
        sys.exit(1)
    else:
        print("\n[PASS] All documentation passed enterprise style guide quality checks.")
        sys.exit(0)

if __name__ == "__main__":
    main()
