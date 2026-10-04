import { describe, expect, it } from "vitest";
import { classifyTransaction, terminalStage } from "@/lib/transaction";
import type { TxRecord } from "@/lib/types";
const base: TxRecord = { hash: "0xabc", label: "test", stage: "submitted", createdAt: 1 };

describe("transaction truth", () => {
  it("keeps accepted provisional", () => expect(classifyTransaction({ status_name: "Accepted" }, base).stage).toBe("accepted"));
  it("does not treat finalized alone as success", () => expect(classifyTransaction({ status_name: "Finalized" }, base).stage).toBe("finalized_unverified"));
  it("recognizes top-level success", () => expect(classifyTransaction({ status_name: "Finalized", tx_execution_result_name: "FinishedWithReturn" }, base).stage).toBe("finalized"));
  it("recognizes top-level error", () => expect(classifyTransaction({ status_name: "Finalized", tx_execution_result_name: "FinishedWithError" }, base).stage).toBe("failed"));
  it("recognizes leader receipt success", () => expect(classifyTransaction({ status_name: "Finalized", consensus_data: { leader_receipt: [{ execution_result: "SUCCESS" }] } }, base).stage).toBe("finalized"));
  it("recognizes an accepted leader rollback among validator receipts", () => expect(classifyTransaction({ status_name: "Accepted", consensus_data: { leader_receipt: [{ mode: "leader", execution_result: "ERROR" }, { mode: "validator", execution_result: "SUCCESS" }] } }, base).stage).toBe("failed"));
  it("ignores arbitrary validator receipt", () => expect(classifyTransaction({ status_name: "Finalized", consensus_data: { validators: [{ execution_result: "SUCCESS" }] } }, base).stage).toBe("finalized_unverified"));
  it("recognizes canceled", () => expect(classifyTransaction({ status_name: "Canceled" }, base).stage).toBe("canceled"));
  it("recognizes undetermined", () => expect(classifyTransaction({ status_name: "Undetermined" }, base).stage).toBe("undetermined"));
  it("recognizes timeout", () => expect(classifyTransaction({ status_name: "ValidatorsTimeout" }, base).stage).toBe("timeout"));
  it("maps numeric finalized and execution", () => expect(classifyTransaction({ status_code: 7, tx_execution_result: 1 }, base).stage).toBe("finalized"));
  it("marks only terminal outcomes terminal", () => { expect(terminalStage("finalized")).toBe(true); expect(terminalStage("accepted")).toBe(false); });
});
