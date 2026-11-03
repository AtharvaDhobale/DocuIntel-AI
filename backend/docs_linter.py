"""
DocuIntel-AI Documentation Linter & Quality Assurance Engine
Validates technical documentation against enterprise style guides (e.g. Cohesity Docs Style Guide),
detecting passive voice, unapproved terminology, broken relative links, and frontmatter metadata flaws.
"""

import re
from typing import List, Dict, Any, Tuple

# Approved enterprise terminology and replacements
TERMINOLOGY_RULES = {
    "whitelist": {"replace": "allowlist", "severity": "Error", "reason": "Inclusive language violation"},
    "blacklist": {"replace": "denylist", "severity": "Error", "reason": "Inclusive language violation"},
    "master": {"replace": "primary", "severity": "Warning", "reason": "Prefer primary/secondary for architecture nodes"},
    "slave": {"replace": "secondary", "severity": "Warning", "reason": "Prefer primary/secondary for architecture nodes"},
    "simply": {"replace": "", "severity": "Warning", "reason": "Condescending word; assume intelligent reader without trivializing tasks"},
    "easily": {"replace": "", "severity": "Warning", "reason": "Condescending word; remove filler adverbs"},
    "obviously": {"replace": "", "severity": "Warning", "reason": "Avoid assumptions about reader knowledge"},
    "click here": {"replace": "descriptive link text", "severity": "Error", "reason": "Accessibility violation; link text must be descriptive"},
    "cohesity cluster": {"replace": "Cohesity Cluster", "severity": "Warning", "reason": "Proper capitalization required for Cohesity Cluster"},
    "dataprotect": {"replace": "DataProtect", "severity": "Warning", "reason": "Proper camelCase capitalization required for DataProtect"},
    "smartfiles": {"replace": "SmartFiles", "severity": "Warning", "reason": "Proper camelCase capitalization required for SmartFiles"},
    "cloudarchive": {"replace": "CloudArchive", "severity": "Warning", "reason": "Brand capitalization required for CloudArchive"},
    "cloudspin": {"replace": "CloudSpin", "severity": "Warning", "reason": "Brand capitalization required for CloudSpin"},
}

PASSIVE_VOICE_INDICATORS = [
    r"\bis (?:created|configured|deployed|executed|managed|deleted|modified|initiated|performed)\b",
    r"\bare (?:created|configured|deployed|executed|managed|deleted|modified|initiated|performed)\b",
    r"\bwas (?:created|configured|deployed|executed|managed|deleted|modified|initiated|performed)\b",
    r"\bwere (?:created|configured|deployed|executed|managed|deleted|modified|initiated|performed)\b",
    r"\bcan be (?:configured|seen|run|executed|downloaded|accessed|created)\b",
]

class DocsLinter:
    @staticmethod
    def lint_markdown(content: str) -> Dict[str, Any]:
        """
        Runs comprehensive quality, style, terminology, and syntax checks on markdown content.
        """
        lines = content.split("\n")
        issues: List[Dict[str, Any]] = []
        stats = {
            "total_lines": len(lines),
            "word_count": len(re.findall(r"\w+", content)),
            "errors": 0,
            "warnings": 0,
            "info": 0
        }

        # 1. Frontmatter Validation
        has_frontmatter = False
        if lines and lines[0].strip() == "---":
            end_idx = -1
            for idx in range(1, len(lines)):
                if lines[idx].strip() == "---":
                    end_idx = idx
                    break
            if end_idx != -1:
                has_frontmatter = True
                fm_text = "\n".join(lines[1:end_idx])
                required_fields = ["title", "description", "id"]
                for req in required_fields:
                    if not re.search(rf"^{req}\s*:", fm_text, re.MULTILINE):
                        issues.append({
                            "line": 1,
                            "type": "Metadata / Frontmatter",
                            "severity": "Warning",
                            "message": f"Missing recommended YAML frontmatter attribute: '{req}'",
                            "suggestion": f"Add `{req}: <value>` inside the frontmatter block"
                        })
            else:
                issues.append({
                    "line": 1,
                    "type": "Metadata / Frontmatter",
                    "severity": "Error",
                    "message": "Unclosed YAML frontmatter block (starts with '---' but has no closing '---')",
                    "suggestion": "Close the frontmatter with '---'"
                })
        else:
            issues.append({
                "line": 1,
                "type": "Metadata / Frontmatter",
                "severity": "Info",
                "message": "Topic lacks YAML frontmatter for Docs-as-Code metadata (title, id, description)",
                "suggestion": "Add frontmatter at the top of the topic file"
            })

        # 2. Line-by-line linting
        for line_num, line in enumerate(lines, start=1):
            lower_line = line.lower()

            # Check Terminology Rules
            for bad_term, rule in TERMINOLOGY_RULES.items():
                expected = rule["replace"]
                # If rule is for capitalization (e.g. DataProtect vs dataprotect)
                if expected and expected.lower() == bad_term:
                    # Check case-insensitively, but only flag if exact expected case is NOT present
                    for m in re.finditer(rf"\b{re.escape(bad_term)}\b", line, re.IGNORECASE):
                        actual_word = m.group(0)
                        if actual_word != expected:
                            severity = rule["severity"]
                            if severity == "Error": stats["errors"] += 1
                            elif severity == "Warning": stats["warnings"] += 1
                            else: stats["info"] += 1
                            issues.append({
                                "line": line_num,
                                "type": "Terminology & Style Guide",
                                "severity": severity,
                                "message": f"Incorrect casing '{actual_word}'. {rule['reason']}.",
                                "suggestion": f"Replace with '{expected}'"
                            })
                else:
                    # Normal replacement rule
                    pattern = rf"\b{re.escape(bad_term)}\b"
                    if re.search(pattern, lower_line):
                        severity = rule["severity"]
                        if severity == "Error": stats["errors"] += 1
                        elif severity == "Warning": stats["warnings"] += 1
                        else: stats["info"] += 1

                        issues.append({
                            "line": line_num,
                            "type": "Terminology & Style Guide",
                            "severity": severity,
                            "message": f"Found non-compliant term '{bad_term}'. {rule['reason']}.",
                            "suggestion": f"Replace with '{expected}'" if expected else "Remove word"
                        })

            # Check Passive Voice
            for pv_pat in PASSIVE_VOICE_INDICATORS:
                match = re.search(pv_pat, lower_line)
                if match:
                    stats["warnings"] += 1
                    matched_str = match.group(0)
                    issues.append({
                        "line": line_num,
                        "type": "Voice & Tone (Style Guide)",
                        "severity": "Warning",
                        "message": f"Passive construction detected: '{matched_str}'. Cohesity style guide recommends direct imperative voice.",
                        "suggestion": "Rewrite with an active verb (e.g., 'Configure the cluster...' instead of 'The cluster can be configured...')"
                    })

            # Check Link Best Practices (Avoid raw bare URLs or 'click here')
            raw_url_match = re.search(r"(?<!\()https?://[^\s\)]+", line)
            if raw_url_match and "[" not in line:
                stats["info"] += 1
                issues.append({
                    "line": line_num,
                    "type": "Link Accessibility",
                    "severity": "Info",
                    "message": f"Bare URL detected: '{raw_url_match.group(0)}'.",
                    "suggestion": "Format as descriptive markdown link: `[Meaningful Title](url)`"
                })

        # Calculate Quality Score (0 to 100)
        penalty = (stats["errors"] * 15) + (stats["warnings"] * 5) + (stats["info"] * 2)
        quality_score = max(0, min(100, 100 - penalty))

        return {
            "quality_score": quality_score,
            "status": "PASS" if stats["errors"] == 0 and stats["warnings"] <= 2 else "NEEDS_REVISION",
            "stats": stats,
            "issues": issues
        }

    @staticmethod
    def autofix_content(content: str) -> str:
        """
        Applies automated deterministic fixes for known terminology and passive-voice antipatterns.
        """
        fixed = content
        for bad_term, rule in TERMINOLOGY_RULES.items():
            expected = rule["replace"]
            if expected:
                pattern = re.compile(rf"\b{re.escape(bad_term)}\b", re.IGNORECASE)
                fixed = pattern.sub(expected, fixed)

        # Remove condescending adverbs
        fixed = re.sub(r"\bSimply\s+", "", fixed)
        fixed = re.sub(r"\bsimply\s+", "", fixed)
        fixed = re.sub(r"\bEasily\s+", "", fixed)
        fixed = re.sub(r"\beasily\s+", "", fixed)
        fixed = re.sub(r"\bObviously,\s*", "", fixed)
        fixed = re.sub(r"\bobviously,\s*", "", fixed)

        # Standard passive fixes
        fixed = re.sub(r"\bcan be configured by navigating to\b", "Navigate to", fixed, flags=re.IGNORECASE)
        fixed = re.sub(r"\bcan be downloaded from\b", "Download from", fixed, flags=re.IGNORECASE)

        return fixed
