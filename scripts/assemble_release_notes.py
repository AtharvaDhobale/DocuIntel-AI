#!/usr/bin/env python3
"""
CLI Tool to assemble customer-ready Release Notes from Git commits or PR titles.
Usage:
    python scripts/assemble_release_notes.py --version v7.2.0 --since HEAD~20
    python scripts/assemble_release_notes.py --version v7.2.0 --file commits.txt
"""

import sys
import subprocess
import argparse
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from server import assemble_release_notes, ReleaseNotesRequest

def main():
    parser = argparse.ArgumentParser(description="Assemble release notes from Git commits.")
    parser.add_argument("--version", default="v7.2.0", help="Release version number (e.g. v7.2.0)")
    parser.add_argument("--since", help="Git revision range, e.g. HEAD~15 or v7.1.0..HEAD")
    parser.add_argument("--file", help="Text file containing raw commit messages")
    parser.add_argument("--output", help="Output file to save release notes markdown")
    args = parser.parse_args()

    raw_commits = ""
    if args.file:
        raw_commits = Path(args.file).read_text(encoding="utf-8")
    elif args.since:
        try:
            res = subprocess.run(["git", "log", "--oneline", args.since], capture_output=True, text=True, check=True)
            raw_commits = res.stdout
        except Exception as e:
            print(f"[ERROR] Failed to run git log: {e}")
            sys.exit(1)
    else:
        # Default sample commits
        raw_commits = """feat(dataprotect): add support for Kubernetes 1.30 stateful volume protection
feat(smartfiles): introduce multi-region S3 bucket replication policy
fix(helios): resolve memory leak during bulk snapshot audit log export
perf(cluster): reduce snapshot tree traversal latency by 35%
fix(security): sanitize session cookies against cross-site script injection
deprecate(api): mark v1 access token endpoints as deprecated in favor of v2/mcm/token
"""

    req = ReleaseNotesRequest(version=args.version, raw_git_commits=raw_commits)
    res = assemble_release_notes(req)
    output_md = res["markdown"]

    if args.output:
        Path(args.output).write_text(output_md, encoding="utf-8")
        print(f"[SUCCESS] Wrote release notes to {args.output}")
    else:
        print(output_md)

if __name__ == "__main__":
    main()
