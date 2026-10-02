import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
const contractPath = join(root, "contract", "contracts", "strata.py");
const contractBytes = readFileSync(contractPath);
const contract = contractBytes.toString("utf8");
const requirements = readFileSync(join(root, "contract", "requirements.txt"), "utf8");
const rootPackage = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const frontendPackage = JSON.parse(readFileSync(join(root, "frontend", "package.json"), "utf8"));
const findings = [];
const exactPins = new Map([
  ["genlayer", [rootPackage.devDependencies?.genlayer, "0.39.1"]],
  ["genlayer-js", [frontendPackage.dependencies?.["genlayer-js"], "1.1.8"]],
]);
for (const [name, [actual, expected]] of exactPins) if (actual !== expected) findings.push(`${name} must be pinned exactly to ${expected}; found ${actual ?? "missing"}`);
for (const pin of [
  "genlayer-py==0.18.0",
  "genlayer-test @ git+https://github.com/genlayerlabs/genlayer-testing-suite.git@343e3a358f9e235a93b49c60721ce7676585ff07",
  "genvm-linter @ git+https://github.com/genlayerlabs/genvm-linter.git@28450e665666300fc648dbe495110dfd0cb6a7b4",
]) if (!requirements.split(/\r?\n/).includes(pin)) findings.push(`Missing exact requirement pin: ${pin}`);
const runner = '# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }';
if (contract.split(/\r?\n/, 1)[0] !== runner) findings.push("Contract runner header changed");
const publicMethods = [...contract.matchAll(/@gl\.public\.(?:view|write)(?:\.payable)?\s+def\s+(\w+)\s*\(/g)].map((match) => match[1]);
const expectedMethods = [
  "launch_transformation", "add_funding", "start_discovery", "advance_discovery", "finalize_manifest", "build_shards",
  "audit_shard", "build_junctions", "audit_junction", "finalize_transformation", "expire_unresolved", "withdraw",
  "get_transformation", "get_change_record", "get_shard", "get_junction", "get_sponsor_total", "get_balance", "get_next_transformation_id"
];
if (JSON.stringify(publicMethods) !== JSON.stringify(expectedMethods)) findings.push(`Contract public surface changed: ${publicMethods.join(", ")}`);
let blobBytes;
const checkpointGitDir = join(root, ".strata-git");
try { blobBytes = execFileSync("git", [`--git-dir=${checkpointGitDir}`, `--work-tree=${root}`, "show", "HEAD:contract/contracts/strata.py"], { cwd: root, encoding: "buffer", stdio: ["ignore", "pipe", "pipe"] }); }
catch (error) { findings.push(`Unable to read contract Git blob: ${error.message}`); }
if (blobBytes && !contractBytes.equals(blobBytes)) findings.push("Working-tree contract bytes differ from canonical HEAD Git blob");
if (findings.length) { console.error(`Integrity audit failed:\n${findings.join("\n")}`); process.exit(1); }
const sha256 = createHash("sha256").update(contractBytes).digest("hex");
const blobSha256 = createHash("sha256").update(blobBytes).digest("hex");
console.log(`Integrity audit passed: exact pins, ${publicMethods.length} public methods, canonical source SHA-256 ${sha256}, Git blob SHA-256 ${blobSha256}.`);
