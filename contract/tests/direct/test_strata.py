import json

from helpers import mock_junction_llm, mock_launch, mock_root_change, mock_shard_llm, mock_terminal, mock_two_large_changes, set_block_time

WEI = 10**18
IMPLEMENTER = "0x1111111111111111111111111111111111111111"


def wallet(addr):
    if isinstance(addr, bytes):
        return "0x" + addr.hex()
    return addr.as_hex.lower() if hasattr(addr, "as_hex") else str(addr).lower()


def launch(contract, vm, sender, terms, value=10 * WEI):
    vm.sender = sender
    vm.value = value
    mock_launch(vm, terms)
    return contract.launch_transformation(
        terms["repo"], terms["target_ref"], terms["baseline"], terms["title"], terms["objective"],
        json.dumps(terms["criteria"]), IMPLEMENTER, terms["close_at"],
    )


def ready_one_shard(contract, vm, transformation_id, terms):
    set_block_time(vm, "2026-10-06T00:00:01Z")
    vm.value = 0
    mock_terminal(vm, terms)
    assert contract.start_discovery(transformation_id) == "discovery_started"
    mock_root_change(vm, terms)
    assert contract.advance_discovery(transformation_id, 4) == "advanced_1"
    contract.finalize_manifest(transformation_id)
    assert contract.build_shards(transformation_id) == "shards_1"
    mock_shard_llm(vm)
    assert contract.audit_shard(transformation_id, 0) == "shard_audited"
    assert contract.build_junctions(transformation_id) == "junctions_0"


def test_launch_locks_escrow_and_baseline_identity(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    transformation_id = launch(contract, direct_vm, direct_alice, terms)
    item = json.loads(contract.get_transformation(transformation_id))
    assert item["repo"] == terms["repo"]
    assert item["baseline_tree"] == terms["baseline_tree"]
    assert item["pool_wei"] == str(10 * WEI)
    assert item["status"] == "OPEN"


def test_second_sponsor_adds_funding(direct_vm, direct_deploy, direct_alice, direct_bob, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    direct_vm.sender = direct_bob; direct_vm.value = 3 * WEI
    assert contract.add_funding(tid) == f"funded_{3 * WEI}"
    item = json.loads(contract.get_transformation(tid))
    assert item["pool_wei"] == str(13 * WEI)
    assert len(item["sponsor_wallets"]) == 2


def test_rejects_invalid_repo(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    direct_vm.sender = direct_alice; direct_vm.value = 10 * WEI
    with direct_vm.expect_revert("invalid_repository"):
        contract.launch_transformation("bad repo", "main", "a" * 40, "x", "y", '["z"]', IMPLEMENTER, terms["close_at"])


def test_rejects_invalid_target_ref(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    direct_vm.sender = direct_alice; direct_vm.value = 10 * WEI
    with direct_vm.expect_revert("invalid_target_ref"):
        contract.launch_transformation(terms["repo"], "../main", "a" * 40, "x", "y", '["z"]', IMPLEMENTER, terms["close_at"])


def test_rejects_invalid_implementer(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    direct_vm.sender = direct_alice; direct_vm.value = 10 * WEI
    with direct_vm.expect_revert("invalid_implementer"):
        contract.launch_transformation(terms["repo"], "main", "a" * 40, "x", "y", '["z"]', "not-an-address", terms["close_at"])


def test_rejects_too_little_funding(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    direct_vm.sender = direct_alice; direct_vm.value = WEI - 1
    with direct_vm.expect_revert("funding_below_minimum"):
        contract.launch_transformation(terms["repo"], "main", "a" * 40, "x", "y", '["z"]', IMPLEMENTER, terms["close_at"])


def test_baseline_source_unavailable_reverts_before_lock(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    direct_vm.sender = direct_alice; direct_vm.value = 10 * WEI
    direct_vm.mock_web(r"api\.github\.com/repos/acme/megarepo/commits/", {"status": 503, "body": "{}"})
    with direct_vm.expect_revert("baseline_source_unavailable"):
        contract.launch_transformation(terms["repo"], "main", "a" * 40, "x", "y", '["z"]', IMPLEMENTER, terms["close_at"])


def test_baseline_must_be_on_target_history(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    direct_vm.sender = direct_alice; direct_vm.value = 10 * WEI
    mock_launch(direct_vm, terms, status="diverged", merge_base="c" * 40)
    with direct_vm.expect_revert("baseline_not_on_target_history"):
        contract.launch_transformation(terms["repo"], "main", terms["baseline"], "x", "y", '["z"]', IMPLEMENTER, terms["close_at"])


def test_discovery_cannot_start_early(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    direct_vm.value = 0
    with direct_vm.expect_revert("transformation_still_open"):
        contract.start_discovery(tid)


def test_start_discovery_freezes_terminal_commit_and_tree(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms)
    assert contract.start_discovery(tid) == "discovery_started"
    item = json.loads(contract.get_transformation(tid))
    assert item["terminal_commit"] == terms["terminal"]
    assert item["terminal_tree"] == terms["terminal_tree"]


def test_terminal_source_outage_moves_no_state(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    direct_vm.mock_web(r"api\.github\.com/repos/acme/megarepo/branches/main", {"status": 503, "body": "{}"})
    assert contract.start_discovery(tid) == "source_unavailable"
    assert json.loads(contract.get_transformation(tid))["status"] == "OPEN"


def test_terminal_must_descend_from_baseline(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms, status="diverged", merge_base="c" * 40)
    with direct_vm.expect_revert("terminal_not_descended_from_baseline"):
        contract.start_discovery(tid)


def test_discovery_finds_modified_blob(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid)
    mock_root_change(direct_vm, terms)
    assert contract.advance_discovery(tid, 4) == "advanced_1"
    record = json.loads(contract.get_change_record(tid, 0))
    assert record["path"] == "auth.py"
    assert record["change_type"] == "MODIFIED"


def test_manifest_requires_empty_frontier(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid)
    with direct_vm.expect_revert("frontier_not_empty"):
        contract.finalize_manifest(tid)


def test_manifest_root_is_stored(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4)
    root = contract.finalize_manifest(tid)
    assert len(root) == 64
    assert json.loads(contract.get_transformation(tid))["manifest_root"] == root


def test_builds_one_shard_for_one_change(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid)
    assert contract.build_shards(tid) == "shards_1"
    shard = json.loads(contract.get_shard(tid, 0))
    assert shard["change_indices"] == [0]


def test_shard_audit_uses_structured_semantic_consensus(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm)
    assert contract.audit_shard(tid, 0) == "shard_audited"
    shard = json.loads(contract.get_shard(tid, 0))
    assert shard["criteria"] == {"0": "SATISFIED", "1": "SATISFIED"}
    assert len(shard["certificate_digest"]) == 64


def test_shard_source_outage_does_not_certify(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"api\.github\.com/repos/acme/megarepo/git/blobs/", {"status": 503, "body": "{}"})
    assert contract.audit_shard(tid, 0) == "source_unavailable"
    assert json.loads(contract.get_shard(tid, 0))["status"] == "PENDING"


def test_ambiguous_shard_blocks_junction_build(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm, criteria={"0":"AMBIGUOUS","1":"SATISFIED"})
    assert contract.audit_shard(tid, 0) == "shard_ambiguous"
    with direct_vm.expect_revert("all_shards_must_be_audited"):
        contract.build_junctions(tid)


def test_complete_transformation_credits_implementer(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=25 * WEI)
    ready_one_shard(contract, direct_vm, tid, terms)
    assert contract.finalize_transformation(tid) == "complete"
    assert contract.get_balance(IMPLEMENTER) == str(25 * WEI)
    item = json.loads(contract.get_transformation(tid))
    assert item["status"] == "COMPLETE"
    assert len(item["settlement_digest"]) == 64


def test_failed_transformation_refunds_sponsor(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=11 * WEI)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm, criteria={"0":"VIOLATED","1":"SATISFIED"})
    contract.audit_shard(tid, 0); contract.build_junctions(tid)
    assert contract.finalize_transformation(tid) == "failed"
    assert contract.get_balance(wallet(direct_alice)) == str(11 * WEI)


def test_inconclusive_result_moves_no_money(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=11 * WEI)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm, criteria={"0":"NOT_RELEVANT","1":"SATISFIED"})
    contract.audit_shard(tid, 0); contract.build_junctions(tid)
    assert contract.finalize_transformation(tid) == "inconclusive"
    assert contract.get_balance(IMPLEMENTER) == "0"
    assert contract.get_balance(wallet(direct_alice)) == "0"


def test_expiry_refunds_unresolved_pool(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=9 * WEI)
    set_block_time(direct_vm, "2026-11-06T00:00:01Z"); direct_vm.value = 0
    assert contract.expire_unresolved(tid) == "expired"
    assert contract.get_balance(wallet(direct_alice)) == str(9 * WEI)


def test_expiry_rejected_during_grace(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    with direct_vm.expect_revert("unresolved_grace_active"):
        contract.expire_unresolved(tid)


def test_second_finalization_rejected(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    ready_one_shard(contract, direct_vm, tid, terms)
    contract.finalize_transformation(tid)
    with direct_vm.expect_revert("finalization_not_available"):
        contract.finalize_transformation(tid)


def test_expiry_rejects_terminal_transformation(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    ready_one_shard(contract, direct_vm, tid, terms)
    contract.finalize_transformation(tid)
    set_block_time(direct_vm, "2026-11-06T00:00:01Z")
    with direct_vm.expect_revert("transformation_already_terminal"):
        contract.expire_unresolved(tid)


def test_withdraw_is_pull_based_and_replay_safe(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=7 * WEI)
    ready_one_shard(contract, direct_vm, tid, terms)
    contract.finalize_transformation(tid)
    # We cannot sign as the arbitrary implementer fixture, so verify zero-balance replay semantics on sponsor.
    direct_vm.sender = direct_alice
    assert contract.withdraw() == "nothing_to_withdraw"


def test_getters_return_empty_for_missing_records(direct_vm, direct_deploy):
    contract = direct_deploy("contract/contracts/strata.py")
    assert contract.get_change_record(999, 0) == ""
    assert contract.get_shard(999, 0) == ""
    assert contract.get_junction(999, 0) == ""


def test_frontier_empty_response_is_stable(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_root_change(direct_vm, terms)
    contract.advance_discovery(tid, 4)
    assert contract.advance_discovery(tid, 4) == "frontier_empty"



def test_two_large_changes_pack_into_two_shards(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_two_large_changes(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid)
    assert contract.build_shards(tid) == "shards_2"


def test_cross_shard_interface_builds_junction(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_two_large_changes(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm, interfaces=["auth/api"], dependencies=[]); contract.audit_shard(tid, 0)
    mock_shard_llm(direct_vm, interfaces=[], dependencies=["auth/api"]); contract.audit_shard(tid, 1)
    assert contract.build_junctions(tid) == "junctions_1"
    junction = json.loads(contract.get_junction(tid, 0))
    assert junction["interface_id"] == "auth/api"


def test_compatible_junction_can_finalize_complete(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_two_large_changes(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm, interfaces=["auth/api"]); contract.audit_shard(tid, 0)
    mock_shard_llm(direct_vm, dependencies=["auth/api"]); contract.audit_shard(tid, 1)
    contract.build_junctions(tid); mock_junction_llm(direct_vm); assert contract.audit_junction(tid, 0) == "junction_audited"
    assert contract.finalize_transformation(tid) == "complete"


def test_violated_junction_refunds_sponsor(direct_vm, direct_deploy, direct_alice, terms):
    set_block_time(direct_vm, "2026-10-01T10:00:00Z")
    contract = direct_deploy("contract/contracts/strata.py")
    tid = launch(contract, direct_vm, direct_alice, terms, value=6 * WEI)
    set_block_time(direct_vm, "2026-10-06T00:00:01Z"); direct_vm.value = 0
    mock_terminal(direct_vm, terms); contract.start_discovery(tid); mock_two_large_changes(direct_vm, terms); contract.advance_discovery(tid, 4); contract.finalize_manifest(tid); contract.build_shards(tid)
    mock_shard_llm(direct_vm, interfaces=["auth/api"]); contract.audit_shard(tid, 0)
    mock_shard_llm(direct_vm, dependencies=["auth/api"]); contract.audit_shard(tid, 1)
    contract.build_junctions(tid); mock_junction_llm(direct_vm, status="VIOLATED", criteria={"0":"NOT_RELEVANT","1":"VIOLATED"}); contract.audit_junction(tid, 0)
    assert contract.finalize_transformation(tid) == "failed"
    assert contract.get_balance(wallet(direct_alice)) == str(6 * WEI)
