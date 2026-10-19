import base64
import hashlib
import json


def set_block_time(vm, iso: str):
    vm.warp(iso)
    try:
        import genlayer
        raw = getattr(genlayer.message, "raw", None)
        if isinstance(raw, dict):
            raw["datetime"] = iso
    except Exception:
        pass


def blob_payload(text: str, sha: str):
    return {
        "sha": sha,
        "encoding": "base64",
        # Match GitHub's MIME-wrapped blob response, including its trailing
        # newline, so every positive shard test covers the production shape.
        "content": base64.b64encode(text.encode("utf-8")).decode("ascii") + "\n",
        "size": len(text.encode("utf-8")),
    }


def git_blob_sha(text: str):
    raw = text.encode("utf-8")
    return hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()


def mock_compare(vm, repo, base, head, status="ahead", merge_base=None, compare_head=None):
    merge_base = base if merge_base is None else merge_base
    compare_head = head if compare_head is None else compare_head
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/compare/{base}\.\.\.{head}$",
        {
            "status": 200,
            "body": json.dumps({
                "status": status,
                "merge_base_commit": {"sha": merge_base},
                "base_commit": {"sha": base},
                "commits": [] if status == "identical" else [{"sha": compare_head}],
            }),
        },
    )


def mock_launch(vm, terms, status="ahead", merge_base=None, compare_head=None):
    repo = terms["repo"]
    baseline = terms["baseline"]
    terminal = terms["terminal"]
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/commits/{baseline}$",
        {
            "status": 200,
            "body": json.dumps({
                "sha": baseline,
                "commit": {"tree": {"sha": terms["baseline_tree"]}},
            }),
        },
    )
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/branches/main$",
        {"status": 200, "body": json.dumps({"name": "main", "commit": {"sha": terminal}})},
    )
    mock_compare(vm, repo, baseline, terminal, status=status, merge_base=merge_base, compare_head=compare_head)
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/contents/auth\.py\?ref={baseline}$",
        {"status": 200, "body": json.dumps({"path": "auth.py", "type": "file", "sha": "3" * 40})},
    )
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/commits/{terminal}$",
        {"status": 200, "body": json.dumps({"sha": terminal, "commit": {"tree": {"sha": terms["terminal_tree"]}}})},
    )
    mock_compare(vm, repo, terminal, terminal, status="identical")


def mock_terminal(vm, terms, status="ahead", merge_base=None):
    vm.clear_mocks()
    repo = terms["repo"]
    baseline = terms["baseline"]
    terminal = terms["terminal"]
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/branches/main$",
        {"status": 200, "body": json.dumps({"name": "main", "commit": {"sha": terminal}})},
    )
    mock_compare(vm, repo, baseline, terminal, status=status, merge_base=merge_base)
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/commits/{terminal}$",
        {
            "status": 200,
            "body": json.dumps({"sha": terminal, "commit": {"tree": {"sha": terms["terminal_tree"]}}}),
        },
    )


def mock_root_change(vm, terms, old_text="legacy_auth(user)", new_text="capability_auth(user)", new_blob_response_sha=None, new_blob_response_text=None):
    repo = terms["repo"]
    old_sha = git_blob_sha(old_text)
    new_sha = git_blob_sha(new_text)
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/git/trees/{terms['baseline_tree']}$",
        {
            "status": 200,
            "body": json.dumps({
                "sha": terms["baseline_tree"],
                "truncated": False,
                "tree": [{"path": "auth.py", "mode": "100644", "type": "blob", "sha": old_sha, "size": len(old_text)}],
            }),
        },
    )
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/git/trees/{terms['terminal_tree']}$",
        {
            "status": 200,
            "body": json.dumps({
                "sha": terms["terminal_tree"],
                "truncated": False,
                "tree": [{"path": "auth.py", "mode": "100644", "type": "blob", "sha": new_sha, "size": len(new_text)}],
            }),
        },
    )
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/git/blobs/{old_sha}$",
        {"status": 200, "body": json.dumps(blob_payload(old_text, old_sha))},
    )
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/git/blobs/{new_sha}$",
        {"status": 200, "body": json.dumps(blob_payload(new_blob_response_text or new_text, new_blob_response_sha or new_sha))},
    )


def mock_shard_llm(vm, criteria=None, interfaces=None, dependencies=None, rationale="The shard directly implements the migration."):
    criteria = criteria or {"0": "SATISFIED", "1": "SATISFIED"}
    vm._llm_mocks.clear()
    vm._llm_mocks_hit.clear()
    vm.mock_llm(
        r"auditing one bounded immutable source shard",
        json.dumps(json.dumps({
            "criteria": criteria,
            "interfaces_changed": interfaces or [],
            "dependencies": dependencies or [],
            "rationale": rationale,
        })),
    )


def mock_junction_llm(vm, status="COMPATIBLE", criteria=None, rationale="Provider and consumer remain compatible."):
    criteria = criteria or {"0": "NOT_RELEVANT", "1": "SATISFIED"}
    vm._llm_mocks.clear()
    vm._llm_mocks_hit.clear()
    vm.mock_llm(
        r"auditing one cross-shard compatibility junction",
        json.dumps(json.dumps({"status": status, "criteria": criteria, "rationale": rationale})),
    )


def mock_two_large_changes(vm, terms):
    repo = terms["repo"]
    text_a_old = "legacy_provider\n" + ("a" * 12900)
    text_a_new = "capability_provider\n" + ("b" * 12900)
    text_b_old = "legacy_consumer\n" + ("c" * 12900)
    text_b_new = "capability_consumer\n" + ("d" * 12900)
    old_a, new_a, old_b, new_b = [git_blob_sha(text) for text in (text_a_old, text_a_new, text_b_old, text_b_new)]
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/git/trees/{terms['baseline_tree']}$",
        {"status": 200, "body": json.dumps({"sha": terms["baseline_tree"], "truncated": False, "tree": [
            {"path":"provider.py","mode":"100644","type":"blob","sha":old_a,"size":len(text_a_old)},
            {"path":"consumer.py","mode":"100644","type":"blob","sha":old_b,"size":len(text_b_old)},
        ]})},
    )
    vm.mock_web(
        rf"api\.github\.com/repos/{repo}/git/trees/{terms['terminal_tree']}$",
        {"status": 200, "body": json.dumps({"sha": terms["terminal_tree"], "truncated": False, "tree": [
            {"path":"provider.py","mode":"100644","type":"blob","sha":new_a,"size":len(text_a_new)},
            {"path":"consumer.py","mode":"100644","type":"blob","sha":new_b,"size":len(text_b_new)},
        ]})},
    )
    for sha, text in [(old_a,text_a_old),(new_a,text_a_new),(old_b,text_b_old),(new_b,text_b_new)]:
        vm.mock_web(rf"api\.github\.com/repos/{repo}/git/blobs/{sha}$", {"status":200,"body":json.dumps(blob_payload(text, sha))})
