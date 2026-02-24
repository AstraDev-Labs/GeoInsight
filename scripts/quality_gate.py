#!/usr/bin/env python3
"""Run a quality gate command set and emit a markdown report.

Default gates:
- npm run build
- npm run seo:check -- http://127.0.0.1:3000
- npm run perf:load -- http://127.0.0.1:3000 10 6

Use --with-lint to include npm run lint.
"""

from __future__ import annotations

import argparse
import datetime as dt
import subprocess
from pathlib import Path


def run_command(cmd: str) -> tuple[bool, str]:
    proc = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    output = (proc.stdout or "") + (proc.stderr or "")
    return proc.returncode == 0, output.strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--with-lint", action="store_true", help="Include npm run lint in gates")
    parser.add_argument(
        "--report",
        default="quality-gate-report.md",
        help="Path to markdown report output",
    )
    args = parser.parse_args()

    commands: list[str] = []
    if args.with_lint:
        commands.append("npm run lint")
    commands.extend(
        [
            "npm run build",
            "npm run seo:check -- http://127.0.0.1:3000",
            "npm run perf:load -- http://127.0.0.1:3000 10 6",
        ]
    )

    lines: list[str] = []
    lines.append(f"# Quality Gate Report ({dt.datetime.utcnow().isoformat()}Z)")
    lines.append("")

    overall_ok = True
    for cmd in commands:
        ok, output = run_command(cmd)
        overall_ok = overall_ok and ok
        status = "PASS" if ok else "FAIL"
        lines.append(f"## {status}: `{cmd}`")
        lines.append("")
        if output:
            lines.append("```text")
            # Keep report bounded.
            lines.append(output[-12000:])
            lines.append("```")
        else:
            lines.append("No output.")
        lines.append("")

    lines.append(f"Overall: {'PASS' if overall_ok else 'FAIL'}")
    Path(args.report).write_text("\n".join(lines), encoding="utf-8")

    print(f"Wrote report: {args.report}")
    return 0 if overall_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())