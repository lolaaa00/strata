import os
from pathlib import Path

import pytest
from gltest.direct.loader import deploy_contract


GENVM_DIRECT_VERSION = "v0.3.0-rc7"


@pytest.fixture
def direct_deploy(direct_vm, tmp_path):
    def _deploy(contract_path, *args, **kwargs):
        contract_path = os.environ.get("STRATA_MUTANT_CONTRACT", contract_path)
        source = Path(contract_path).read_text(encoding="utf-8")
        source = source.replace(
            'py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6',
            'py-genlayer:1zr6nqk597d97kg0dyxg0shhrykx5v02zjgnyrajapy4wlqvfvwh',
            1,
        ).replace(
            "from genlayer import *",
            "import genlayer as gl\nfrom genlayer import Address, TreeMap, u256",
            1,
        ).replace(
            "class Strata(gl.Contract):",
            "class Strata(gl.contract.Contract):",
            1,
        )
        adapter = tmp_path / "strata_direct_adapter.py"
        adapter.write_text(source, encoding="utf-8", newline="\n")
        return deploy_contract(
            adapter.resolve(),
            direct_vm,
            *args,
            sdk_version=GENVM_DIRECT_VERSION,
            **kwargs,
        )
    return _deploy


@pytest.fixture
def terms():
    return {
        "repo": "acme/megarepo",
        "target_ref": "main",
        "baseline": "a" * 40,
        "baseline_tree": "1" * 40,
        "terminal": "b" * 40,
        "terminal_tree": "2" * 40,
        "title": "Auth subsystem migration",
        "objective": "Replace the legacy authentication interface while preserving authorization semantics.",
        "criteria": [
            "All legacy authentication entry points are removed from the changed product state.",
            "Callers preserve authorization semantics through the replacement interface.",
        ],
        "close_at": 1791201600,
    }
