import { describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import { deleteState, loadState, saveState } from "@/lib/persistence/db";
import { createDemoData } from "@/lib/demo/seed";
import {
  deleteProduct,
  emptyData,
  parseExport,
  recordAdherence,
  saveProfile,
  serializeExport,
  upsertProduct,
} from "@/lib/state/model";
import { makeProduct, makeProfile } from "@/lib/test/factories";

describe("persistence, export, and deletion", () => {
  it("saves and reloads a profile, products, and adherence", async () => {
    await deleteState("celestcare");
    let data = saveProfile(emptyData(), makeProfile({ displayName: "Local" }));
    data = upsertProduct(data, makeProduct({ id: "p1", name: "Cream", category: "moisturizer" }));
    data = recordAdherence(data, {
      id: "a1",
      date: "2026-10-19",
      period: "am",
      productId: "p1",
      action: "completed",
      at: "2026-10-19T12:00:00.000Z",
    });
    await saveState("celestcare", data);
    const loaded = await loadState("celestcare");
    expect(loaded?.profile?.displayName).toBe("Local");
    expect(loaded?.products).toHaveLength(1);
    expect(loaded?.adherence[0]?.action).toBe("completed");
    await deleteState("celestcare");
    expect(await loadState("celestcare")).toBeNull();
  });

  it("exports and deletes personal data without mixing in the demo shelf", async () => {
    const demo = createDemoData();
    const user = upsertProduct(emptyData(), makeProduct({ id: "real", name: "My cleanser", category: "cleanser" }));
    const exported = serializeExport(user, "2026-10-19T00:00:00.000Z");
    expect(exported).toContain("My cleanser");
    expect(exported).not.toContain("Northwater");
    const restored = parseExport(exported);
    expect(restored.products.map((product) => product.id)).toEqual(["real"]);
    const cleared = deleteProduct(restored, "real");
    expect(cleared.products).toHaveLength(0);
    expect(demo.products.length).toBeGreaterThan(3);
    expect(demo.products.some((product) => product.provenance.source === "illustrative-demo")).toBe(true);
  });

  it("rejects a file that is not an export", () => {
    expect(() => parseExport("{}")).toThrow(/not a CelestCare export/);
  });
});
