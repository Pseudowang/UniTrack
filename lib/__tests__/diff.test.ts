import { describe, expect, it } from "vitest";
import { diffSnapshots } from "../diff";

describe("diffSnapshots", () => {
  it("marks creation when previous snapshot is missing", () => {
    const result = diffSnapshots(null, {
      title: "Product A",
      priceCent: 9900,
      listPriceCent: 12900,
      inStock: true,
    });

    expect(result.changed).toBe(true);
    expect(result.changeType).toBe("created");
    expect(result.diff.title).toEqual({ previous: null, current: "Product A" });
  });

  it("detects updated fields", () => {
    const result = diffSnapshots(
      {
        title: "Product A",
        priceCent: 9900,
        listPriceCent: 12900,
        inStock: true,
      },
      {
        title: "Product A v2",
        priceCent: 10900,
        listPriceCent: 12900,
        inStock: false,
      }
    );

    expect(result.changed).toBe(true);
    expect(result.changeType).toBe("updated");
    expect(Object.keys(result.diff)).toEqual(
      expect.arrayContaining(["title", "priceCent", "inStock"])
    );
  });

  it("returns none when snapshots match", () => {
    const base = {
      title: "Product A",
      priceCent: 9900,
      listPriceCent: 12900,
      inStock: true,
    };
    const result = diffSnapshots(base, { ...base });

    expect(result.changed).toBe(false);
    expect(result.changeType).toBe("none");
    expect(result.diff).toEqual({});
  });
});
