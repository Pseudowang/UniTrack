import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { UNIQLO_API } from "./constants";
import { buildProductImageUrl, isApiProductCode } from "./product-code";

export const UNIQLO_SPU_API_BASE = UNIQLO_API.PRODUCT_INFO_BASE_URL;

export interface ProductSku {
  id: string;
  label: string;
  inStock: boolean;
  priceCent?: number;
}

export interface Product {
  productCode: string;
  title: string;
  priceCent?: number;
  listPriceCent?: number;
  inStock?: boolean;
  imageUrl?: string;
  skus: ProductSku[];
  raw: Prisma.InputJsonValue;
  etag: string;
}

type MockProductBase = Omit<Product, "productCode" | "raw" | "etag">;

// 模拟商品数据
const MOCK_PRODUCTS: Record<string, MockProductBase> = {
  "465167": {
    title: "UNIQLO AIRism Cotton Oversized T-Shirt",
    priceCent: 9900,
    listPriceCent: 14900,
    inStock: true,
    imageUrl:
      "https://www.uniqlo.cn/hmall/test/airism-cotton-oversized-tees.jpg",
    skus: [
      {
        id: "465167-BLACK-M",
        label: "Black / M",
        inStock: true,
        priceCent: 9900,
      },
      {
        id: "465167-WHITE-L",
        label: "White / L",
        inStock: true,
        priceCent: 9900,
      },
      {
        id: "465167-NAVY-XL",
        label: "Navy / XL",
        inStock: false,
        priceCent: 9900,
      },
    ],
  },
  "465168": {
    title: "UNIQLO Ultra Light Down Jacket",
    priceCent: 59900,
    listPriceCent: 79900,
    inStock: true,
    imageUrl: "https://www.uniqlo.cn/hmall/test/ultra-light-down-jacket.jpg",
    skus: [
      {
        id: "465168-GREY-M",
        label: "Grey / M",
        inStock: true,
        priceCent: 59900,
      },
      {
        id: "465168-GREY-L",
        label: "Grey / L",
        inStock: true,
        priceCent: 59900,
      },
      {
        id: "465168-NAVY-S",
        label: "Navy / S",
        inStock: false,
        priceCent: 59900,
      },
    ],
  },
};

interface UniqloProdInfo {
  originPrice?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  score?: string;
  inactive?: string; // "N"
  maxVaryPrice?: string;
  minSize?: string;
  stock?: string; // "Y"
  hasStock?: string; // "Y"
  gDeptValue?: string;
  priceColor?: string;
  evaluationCount?: string;
  name?: string;
  code?: string;
  maxSize?: string;
  enabledFlag?: string; // "Y"
  sex?: string;
  fullName?: string;
  minVaryPrice?: string;
  productCode?: string;
  [key: string]: unknown;
}

/**
 * 根据商品关键字段生成稳定的 etag，用于判断快照是否发生变化。
 */
export function computeEtag(payload: {
  title?: string | null;
  priceCent?: number | null;
  listPriceCent?: number | null;
  inStock?: boolean | null;
}): string {
  const base = [
    payload.title ?? "",
    payload.priceCent ?? "",
    payload.listPriceCent ?? "",
    payload.inStock ?? "",
  ].join("|");

  return createHash("md5").update(base).digest("hex");
}

/**
 * 获取商品数据。
 * API 编码优先走官方接口，失败时回退到本地 mock 数据，方便教学和离线演示。
 */
export async function fetchProduct(productCode: string): Promise<Product> {
  if (isApiProductCode(productCode)) {
    try {
      return await fetchUniqloSpuProduct(productCode);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[scraper] 获取 ${productCode} 的官方数据失败，将回退到 mock 数据`,
          error
        );
      }
    }
  }

  return buildMockProduct(productCode);
}

function fetchRequestUrl(productCode: string) {
  return `${UNIQLO_SPU_API_BASE}/${productCode.toLowerCase()}.json`;
}

/**
 * 从 UNIQLO 官方接口抓取 SPU 商品数据。
 */
async function fetchUniqloSpuProduct(productCode: string): Promise<Product> {
  const response = await fetch(fetchRequestUrl(productCode), {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`UNIQLO 接口请求失败，状态码：${response.status}`);
  }

  const payload = (await response.json()) as UniqloProdInfo;
  return mapSpuPayload(productCode, payload);
}

/**
 * 将官方接口返回的数据转换为应用内部的 Product 结构。
 */
function mapSpuPayload(
  fallbackCode: string,
  payload: UniqloProdInfo
): Product {
  const listPriceCent = yuanToCent(payload.originPrice);
  const priceCent = yuanToCent(payload.minPrice);

  const title =
    payload.fullName?.trim() ||
    payload.name?.trim() ||
    `UNIQLO 商品 ${payload.productCode ?? fallbackCode}`;

  const inStock = (payload.hasStock ?? "").toUpperCase() === "Y";
  const skus: ProductSku[] = [];

  const etag = computeEtag({
    title,
    priceCent,
    listPriceCent,
    inStock,
  });

  return {
    productCode: payload.productCode ?? fallbackCode,
    title,
    priceCent,
    listPriceCent,
    inStock,
    imageUrl: buildProductImageUrl(payload.productCode ?? fallbackCode),
    skus,
    raw: payload as Prisma.InputJsonValue,
    etag,
  };
}



function buildMockProduct(productCode: string): Product {
  const mockBase =
    MOCK_PRODUCTS[productCode] ?? buildMockBaseFromCode(productCode);

  const raw = JSON.parse(
    JSON.stringify({
      ...mockBase,
      productCode,
      source: "mock",
      fetchedAt: new Date().toISOString(),
    })
  ) as Prisma.InputJsonValue;

  const etag = computeEtag({
    title: mockBase.title,
    priceCent: mockBase.priceCent,
    listPriceCent: mockBase.listPriceCent,
    inStock: mockBase.inStock,
  });

  return {
    ...mockBase,
    productCode,
    raw,
    etag,
  };
}

function buildMockBaseFromCode(productCode: string): MockProductBase {
  const fallbackPrice = (Math.abs(hashAsInt(productCode)) % 80000) + 9900;

  return {
    title: `UNIQLO 商品 ${productCode}`,
    priceCent: fallbackPrice,
    listPriceCent: fallbackPrice + 3000,
    inStock: true,
    imageUrl: `https://www.uniqlo.cn/hmall/item/${productCode}.jpg`,
    skus: [
      {
        id: `${productCode}-DEFAULT`,
        label: `默认 / 均码`,
        inStock: true,
        priceCent: fallbackPrice,
      },
    ],
  };
}

function yuanToCent(value?: number | string | null): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numeric = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  return Math.round(numeric * 100);
}

function hashAsInt(value: string): number {
  const hash = createHash("md5").update(value).digest("hex").slice(0, 8);
  return parseInt(hash, 16);
}
