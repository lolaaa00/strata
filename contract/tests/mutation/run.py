"""Small actual-contract mutation gate for STRATA.

This deliberately mutates the real contract source, runs the normal Direct Mode
suite unchanged, and requires every listed critical mutant to be killed.
"""
from pathlib import Path
import os
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "contract" / "contracts" / "strata.py"
BASE = SOURCE.read_text(encoding="utf-8")
MUTANTS = [
    ("allow_invalid_ref", 'if not _ref_ok(target_ref):', 'if False and not _ref_ok(target_ref):'),
    ("allow_underfunded_launch", 'if amount < MIN_FUND_WEI:', 'if amount < 0:'),
    ("skip_baseline_history", 'if status not in {"ahead", "identical"} or merge_base_sha != baseline:', 'if False:'),
    ("skip_terminal_history", 'if status not in {"ahead", "identical"} or merge_base_sha != baseline:\n        return _canonical_json({"status": "INVALID", "reason": "terminal_not_descended_from_baseline"})', 'if False:\n        return _canonical_json({"status": "INVALID", "reason": "terminal_not_descended_from_baseline"})'),
    ("allow_early_discovery", 'if _now_unix() <= int(item["close_at"]):', 'if False and _now_unix() <= int(item["close_at"]):'),
    ("allow_early_expiry", 'if _now_unix() <= int(item["close_at"]) + UNRESOLVED_GRACE_SECONDS:', 'if False and _now_unix() <= int(item["close_at"]) + UNRESOLVED_GRACE_SECONDS:'),
    ("complete_on_any_satisfied", 'if statuses and all(status == "SATISFIED" for status in statuses):', 'if statuses and any(status == "SATISFIED" for status in statuses):'),
    ("remove_terminal_guard", 'if item["status"] in TERMINAL_STATES:\n            raise gl.vm.UserError("transformation_already_terminal")', 'if False:\n            raise gl.vm.UserError("transformation_already_terminal")'),
]

def run(path: Path):
    env = dict(os.environ)
    env["STRATA_MUTANT_CONTRACT"] = str(path)
    return subprocess.run([sys.executable, "-m", "pytest", "contract/tests/direct", "-q"], cwd=ROOT, env=env).returncode

if os.environ.get("STRATA_MUTATION_SKIP") == "1":
    print("Mutation gate skipped by STRATA_MUTATION_SKIP=1")
    raise SystemExit(0)

survivors=[]
with tempfile.TemporaryDirectory(prefix="strata-mut-") as tmp:
    for name, old, new in MUTANTS:
        if old not in BASE:
            print(f"mutation definition stale: {name}")
            survivors.append(name)
            continue
        mutated=BASE.replace(old,new,1)
        path=Path(tmp)/f"{name}.py"
        path.write_text(mutated,encoding="utf-8",newline="\n")
        code=run(path)
        if code==0:
            survivors.append(name)
            print(f"SURVIVED {name}")
        else:
            print(f"KILLED {name}")
if survivors:
    print("Critical mutation survivors:", ", ".join(survivors))
    raise SystemExit(1)
print(f"Mutation gate passed: {len(MUTANTS)}/{len(MUTANTS)} critical mutants killed.")
