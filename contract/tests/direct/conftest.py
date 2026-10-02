import os
from pathlib import Path

import pytest
from gltest.direct.loader import deploy_contract


GENVM_DIRECT_VERSION = "v0.3.0-rc7"


@pytest.fixture
def direct_deploy(direct_vm):
    def _deploy(contract_path, *args, **kwargs):
        contract_path = os.environ.get("STRATA_MUTANT_CONTRACT", contract_path)
        return deploy_contract(
            Path(contract_path).resolve(),
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
