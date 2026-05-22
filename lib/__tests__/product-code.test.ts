import { describe, expect, it } from "vitest";
import {
  buildProductImageUrl,
  parseProductCode,
} from "../product-code";

describe("parseProductCode", () => {
  it("parses detail page urls", () => {
    const result = parseProductCode(
      "https://www.uniqlo.cn/product-detail.html?productCode=465167"
    );

    expect(result).toEqual({
      productCode: "465167",
      isUrl: true,
      kind: "detail",
    });
  });

  it("parses spu api urls", () => {
    const result = parseProductCode(
      "https://www.uniqlo.cn/data/products/spu/zh_CN/u0000000067280.json"
    );

    expect(result).toEqual({
      productCode: "u0000000067280",
      isUrl: true,
      kind: "api",
    });
  });

  it("rejects unsupported domains", () => {
    expect(() => parseProductCode("https://example.com/product/465167")).toThrow(
      "仅支持 uniqlo.cn 域名下的商品链接"
    );
  });
});

describe("buildProductImageUrl", () => {
  it("builds api product image urls", () => {
    expect(buildProductImageUrl("u0000000067280")).toBe(
      "https://www.uniqlo.cn/hmall/test/u0000000067280/main/first/1000/1.jpg"
    );
  });

  it("builds detail product image urls", () => {
    expect(buildProductImageUrl("465167")).toBe(
      "https://www.uniqlo.cn/hmall/item/465167.jpg"
    );
  });
});
