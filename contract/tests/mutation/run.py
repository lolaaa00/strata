"""Critical mutation gate against the real STRATA contract source."""
from pathlib import Path
import os, subprocess, sys, tempfile

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "contract" / "contracts" / "strata.py"
BASE = SOURCE.read_text(encoding="utf-8")
# name, exact source guard, mutation, focused Direct Mode proof
MUTANTS = [
    ("allow_empty_scope", "if not isinstance(value, list) or not (1 <= len(value) <= MAX_SCOPE_ENTRIES):", "if False:", "test_scope_validation_fails_closed"),
    ("allow_checkpoint_by_anyone", 'if _wallet(gl.message.sender_address) != item["implementer_wallet"]:', "if False:", "test_checkpoint_requires_implementer"),
    ("allow_late_checkpoint", 'if now >= int(item["close_at"]):', "if False:", "test_checkpoint_rejected_after_close"),
    ("allow_discovery_without_checkpoint", 'if not item.get("checkpoint_digest"):', "if False:", "test_discovery_requires_checkpoint"),
    ("select_non_checkpoint_terminal", 'item["terminal_commit"] = item["checkpoint_commit"]', 'item["terminal_commit"] = "f" * 40', "test_post_close_branch_movement_cannot_change_terminal"),
    ("accept_wrong_blob_content", 'if _git_blob_sha(raw) != expected_sha:', "if False:", "test_blob_content_hash_is_verified"),
    ("move_funds_on_proposal", 'item["status"] = "PROVISIONAL"', 'self._credit(item["implementer_wallet"], int(item["pool_wei"]))\n        item["status"] = "PROVISIONAL"', "test_provisional_complete_moves_no_money"),
    ("allow_early_settlement", 'if _now_unix() <= int(item.get("challenge_deadline") or 0):', "if False:", "test_settlement_waits_for_challenge_window"),
    ("allow_uncommitted_challenge_path", 'if evidence_index < 0:', "if False:", "test_challenge_rejects_uncommitted_path"),
    ("allow_expiry_over_certificate", 'if item["status"] in {"PROVISIONAL", "READY_TO_SETTLE"}:', "if False:", "test_expiry_cannot_override_valid_provisional_certificate"),
]

def run(path: Path, test: str):
    env = dict(os.environ, STRATA_MUTANT_CONTRACT=str(path), PYTHONPYCACHEPREFIX="/tmp/strata-mut-pycache")
    return subprocess.run([sys.executable, "-m", "pytest", f"contract/tests/direct/test_strata.py::{test}", "-q"], cwd=ROOT, env=env, stdout=subprocess.DEVNULL).returncode

survivors=[]
with tempfile.TemporaryDirectory(prefix="strata-mut-") as tmp:
    for name, old, new, test in MUTANTS:
        if old not in BASE:
            print(f"STALE {name}"); survivors.append(name); continue
        path=Path(tmp)/f"{name}.py"; path.write_text(BASE.replace(old,new,1), encoding="utf-8")
        if run(path,test)==0:
            print(f"SURVIVED {name}"); survivors.append(name)
        else:
            print(f"KILLED {name}")
if survivors:
    print("Critical mutation survivors:", ", ".join(survivors)); raise SystemExit(1)
print(f"Mutation gate passed: {len(MUTANTS)}/{len(MUTANTS)} critical mutants killed.")
