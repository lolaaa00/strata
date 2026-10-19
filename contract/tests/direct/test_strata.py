import json

import pytest

from helpers import blob_payload, git_blob_sha, mock_launch, mock_root_change, mock_shard_llm, set_block_time

WEI = 10**18
IMPLEMENTER = "0x1111111111111111111111111111111111111111"


def launch(contract, vm, sponsor, terms, scope=None, value=10 * WEI, checkpoint=True):
    set_block_time(vm, "2026-10-01T10:00:00Z")
    vm.sender, vm.value = sponsor, value
    mock_launch(vm, terms)
    selected_scope = scope or ["auth.py"]
    for path in selected_scope:
        direct_vm_path = path.replace(".", r"\.")
        vm.mock_web(rf"api\.github\.com/repos/{terms['repo']}/contents/{direct_vm_path}\?ref={terms['baseline']}$",
                    {"status": 200, "body": json.dumps({"path": path, "type": "file", "sha": "3" * 40})})
    tid = contract.launch_transformation(
        terms["repo"], terms["target_ref"], terms["baseline"], terms["title"], terms["objective"],
        json.dumps(terms["criteria"]), json.dumps(selected_scope), IMPLEMENTER, terms["close_at"],
    )
    if checkpoint:
        vm.sender, vm.value = IMPLEMENTER, 0
        assert contract.submit_delivery_checkpoint(tid, terms["terminal"]) == "checkpoint_submitted"
    return tid


def through_evidence(contract, vm, tid, terms):
    set_block_time(vm, "2026-10-06T00:00:01Z")
    vm.value = 0
    assert contract.start_discovery(tid) == "discovery_started"
    mock_root_change(vm, terms)
    assert contract.advance_discovery(tid, 4) == "advanced_1"
    contract.finalize_manifest(tid)
    assert contract.start_scope_discovery(tid) == "scope_discovery_started"
    assert contract.advance_scope_discovery(tid, 4) == "scope_advanced_1"
    assert contract.finalize_scope_discovery(tid) == "scope_files_1"
    assert contract.process_evidence(tid, 4) == "evidence_processed_1"
    assert contract.finalize_evidence(tid) == "complete"


def ready(contract, vm, tid, terms, criteria=None):
    through_evidence(contract, vm, tid, terms)
    assert contract.build_shards(tid) == "shards_1"
    mock_shard_llm(vm, criteria=criteria)
    assert contract.audit_shard(tid, 0) == "shard_audited"
    assert contract.build_junctions(tid) == "junctions_0"


def item(contract, tid):
    return json.loads(contract.get_transformation(tid))


def test_launch_locks_terms_scope_and_escrow(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    state = item(contract, tid)
    assert state["scope"] == ["auth.py"]
    assert state["pool_wei"] == str(10 * WEI)
    assert state["checkpoint_commit"] == terms["terminal"]


@pytest.mark.parametrize("scope,error", [([], "invalid_scope"), (["../secret"], "invalid_scope_path"), (["src", "src/a.py"], "ambiguous_scope_paths"), (["a", "a"], "duplicate_scope_path")])
def test_scope_validation_fails_closed(direct_vm, direct_deploy, direct_alice, terms, scope, error):
    contract = direct_deploy("contract/contracts/strata.py")
    set_block_time(direct_vm, "2026-10-01T10:00:00Z"); direct_vm.sender = direct_alice; direct_vm.value = WEI
    with direct_vm.expect_revert(error):
        contract.launch_transformation(terms["repo"], "main", terms["baseline"], "x", "y", '["z"]', json.dumps(scope), IMPLEMENTER, terms["close_at"])


def test_checkpoint_replacement_before_close(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    mock_launch(direct_vm, terms)
    assert contract.submit_delivery_checkpoint(tid, terms["terminal"]) == "checkpoint_submitted"
    assert item(contract, tid)["checkpoint_submitted_at"] > 0


def test_checkpoint_requires_implementer(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, checkpoint=False)
    direct_vm.sender, direct_vm.value = direct_alice, 0
    with direct_vm.expect_revert("checkpoint_not_implementer"):
        contract.submit_delivery_checkpoint(tid, terms["terminal"])


def test_checkpoint_rejected_after_close(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, checkpoint=False)
    direct_vm.sender = IMPLEMENTER; set_block_time(direct_vm, "2026-10-06T00:00:01Z")
    with direct_vm.expect_revert("checkpoint_deadline_passed"):
        contract.submit_delivery_checkpoint(tid, terms["terminal"])


def test_discovery_requires_checkpoint(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, checkpoint=False)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z")
    with direct_vm.expect_revert("delivery_checkpoint_required"):
        contract.start_discovery(tid)


def test_post_close_branch_movement_cannot_change_terminal(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    direct_vm.clear_mocks(); set_block_time(direct_vm, "2026-10-06T00:00:01Z")
    assert contract.start_discovery(tid) == "discovery_started"
    assert item(contract, tid)["terminal_commit"] == terms["terminal"]


def test_checkpoint_source_outage_preserves_previous_checkpoint(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    before = item(contract, tid)["checkpoint_digest"]
    direct_vm.clear_mocks(); direct_vm.mock_web(r"api\.github\.com/repos/acme/megarepo/commits/", {"status": 503, "body": "{}"})
    assert contract.submit_delivery_checkpoint(tid, terms["terminal"]) == "source_unavailable"
    assert item(contract, tid)["checkpoint_digest"] == before


def test_manifest_and_scope_include_unchanged_identity(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    through_evidence(contract, direct_vm, tid, terms)
    evidence = json.loads(contract.get_evidence_record(tid, 0))
    assert evidence["path"] == "auth.py"
    assert evidence["coverage_status"] == "COMPLETE"
    assert item(contract, tid)["evidence_coverage_root"]


def test_blob_content_hash_is_verified(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); contract.start_discovery(tid)
    old_text, new_text = "legacy_auth(user)", "capability_auth(user)"
    mock_root_change(direct_vm, terms, old_text=old_text, new_text=new_text, new_blob_response_text="x" * len(new_text))
    contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.start_scope_discovery(tid); contract.advance_scope_discovery(tid, 4); contract.finalize_scope_discovery(tid)
    assert contract.process_evidence(tid, 4) == "evidence_processed_1"
    assert contract.finalize_evidence(tid) == "unresolved"


def test_model_empty_dependency_hints_do_not_change_graph_root(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    through_evidence(contract, direct_vm, tid, terms)
    root = item(contract, tid)["dependency_graph_root"]
    contract.build_shards(tid); mock_shard_llm(direct_vm, dependencies=[]); contract.audit_shard(tid, 0)
    assert item(contract, tid)["dependency_graph_root"] == root


def test_python_dependency_graph_includes_unchanged_provider(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, scope=["consumer.py", "provider.py"])
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); contract.start_discovery(tid)
    old_consumer, new_consumer, provider = "print('old')\n", "from .provider import api\n", "def api(): return True\n"
    old_sha, new_sha, provider_sha = map(git_blob_sha, (old_consumer, new_consumer, provider))
    base_tree = [{"path":"consumer.py","mode":"100644","type":"blob","sha":old_sha,"size":len(old_consumer)}, {"path":"provider.py","mode":"100644","type":"blob","sha":provider_sha,"size":len(provider)}]
    delivery_tree = [{"path":"consumer.py","mode":"100644","type":"blob","sha":new_sha,"size":len(new_consumer)}, {"path":"provider.py","mode":"100644","type":"blob","sha":provider_sha,"size":len(provider)}]
    for tree_sha, entries in ((terms["baseline_tree"],base_tree),(terms["terminal_tree"],delivery_tree)):
        direct_vm.mock_web(rf"api\.github\.com/repos/{terms['repo']}/git/trees/{tree_sha}$", {"status":200,"body":json.dumps({"sha":tree_sha,"truncated":False,"tree":entries})})
    for sha, text in ((old_sha,old_consumer),(new_sha,new_consumer),(provider_sha,provider)):
        direct_vm.mock_web(rf"api\.github\.com/repos/{terms['repo']}/git/blobs/{sha}$", {"status":200,"body":json.dumps(blob_payload(text,sha))})
    contract.advance_discovery(tid,4); contract.finalize_manifest(tid); contract.start_scope_discovery(tid); contract.advance_scope_discovery(tid,4); contract.finalize_scope_discovery(tid); contract.process_evidence(tid,4)
    assert contract.finalize_evidence(tid) == "complete"
    edge = json.loads(contract.get_dependency_edge(tid,0))
    assert edge["consumer_path"] == "consumer.py" and edge["provider_path"] == "provider.py" and edge["resolved"] is True


def test_provisional_complete_moves_no_money(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=7 * WEI)
    ready(contract, direct_vm, tid, terms)
    assert contract.propose_certificate(tid) == "provisional_complete"
    state = item(contract, tid)
    assert state["status"] == "PROVISIONAL" and state["pool_wei"] == str(7 * WEI)
    assert contract.get_balance(IMPLEMENTER) == "0"


def test_duplicate_proposal_cannot_reset_deadline(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    deadline = item(contract, tid)["challenge_deadline"]
    with direct_vm.expect_revert("finalization_not_available"):
        contract.propose_certificate(tid)
    assert item(contract, tid)["challenge_deadline"] == deadline


def test_sponsor_can_challenge_complete_with_committed_path(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    direct_vm.sender = direct_alice
    assert contract.challenge_certificate(tid, 0, "auth.py", "The unchanged caller still uses the legacy path.") == "challenge_0"
    assert item(contract, tid)["status"] == "CHALLENGED"


def test_arbitrary_wallet_cannot_challenge_complete(direct_vm, direct_deploy, direct_alice, direct_bob, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("challenger_not_sponsor"):
        contract.challenge_certificate(tid, 0, "auth.py", "material reason")


def test_challenge_rejects_uncommitted_path(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("challenge_evidence_not_committed"):
        contract.challenge_certificate(tid, 0, "outside.py", "material reason")


def test_settlement_waits_for_challenge_window(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    with direct_vm.expect_revert("challenge_window_active"):
        contract.settle_certificate(tid)


def test_challenge_reassessment_preserves_supported_result(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    direct_vm.sender = direct_alice
    contract.challenge_certificate(tid, 0, "auth.py", "Recheck the committed implementation evidence.")
    set_block_time(direct_vm, "2026-10-06T00:16:00Z"); mock_shard_llm(direct_vm)
    assert contract.review_challenge(tid) == "ready_to_settle"
    assert item(contract, tid)["provisional_result"] == "COMPLETE"
    assert contract.settle_certificate(tid) == "complete"


def test_unchallenged_complete_settles_once_and_withdraws_once(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=5 * WEI); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    set_block_time(direct_vm, "2026-10-06T00:16:00Z")
    assert contract.settle_certificate(tid) == "complete"
    assert contract.get_balance(IMPLEMENTER) == str(5 * WEI)
    with direct_vm.expect_revert("certificate_not_settleable"):
        contract.settle_certificate(tid)
    direct_vm.sender = IMPLEMENTER
    assert contract.withdraw() == f"withdrew_{5 * WEI}"
    assert contract.withdraw() == "nothing_to_withdraw"


def test_failed_provisional_refunds_only_after_window(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=3 * WEI)
    ready(contract, direct_vm, tid, terms, criteria={"0": "VIOLATED", "1": "SATISFIED"})
    assert contract.propose_certificate(tid) == "provisional_failed"
    assert contract.get_balance(str(direct_alice)) == "0"
    set_block_time(direct_vm, "2026-10-06T00:16:00Z")
    assert contract.settle_certificate(tid) == "failed"


def test_expiry_cannot_override_valid_provisional_certificate(direct_vm, direct_deploy, direct_alice, terms):
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms); ready(contract, direct_vm, tid, terms); contract.propose_certificate(tid)
    set_block_time(direct_vm, "2026-12-01T00:00:00Z")
    with direct_vm.expect_revert("valid_certificate_pending_settlement"):
        contract.expire_unresolved(tid)
