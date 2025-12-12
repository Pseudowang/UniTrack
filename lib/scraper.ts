import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { buildProductImageUrl, isApiProductCode } from "./product-code";

export const UNIQLO_SPU_API_BASE =
  "https://www.uniqlo.cn/data/products/prodInfo/zh_CN/";

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

export async function fetchProduct(productCode: string): Promise<Product> {
  if (isApiProductCode(productCode)) {
    try {
      return await fetchUniqloSpuProduct(productCode);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[scraper] failed to fetch ${productCode} from uniqlo.cn`,
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

async function fetchUniqloSpuProduct(productCode: string): Promise<Product> {
  const response = await fetch(fetchRequestUrl(productCode), {
    headers: {
      Accept: "application/json",
      "User-Agent": "unitrack-bot/0.1",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Uniqlo API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as UniqloProdInfo;
  return mapSpuPayload(productCode, payload);
}

function mapSpuPayload(
  fallbackCode: string,
  payload: UniqloProdInfo
): Product {
  // New API structure mapping
  const listPriceCent = yuanToCent(payload.originPrice);
  const priceCent = yuanToCent(payload.minPrice);

  const title =
    payload.fullName?.trim() ||
    payload.name?.trim() ||
    `UNIQLO 商品 ${payload.productCode ?? fallbackCode}`;

  const inStock = (payload.hasStock ?? "").toUpperCase() === "Y";

  // The new API endpoint does not provide detailed SKU lists in the same way.
  // We will return an empty list for skus, or we could synthesize a single 'default' SKU.
  // Given the tracking nature, having at least one SKU might be useful, but for now
  // we follow the plan to keep it minimal as price/stock are top-level.
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
    // We try to pick an image if available, otherwise fallback to standard URL builder
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
    title: `UNIQLO Product ${productCode}`,
    priceCent: fallbackPrice,
    listPriceCent: fallbackPrice + 3000,
    inStock: true,
    imageUrl: `https://www.uniqlo.cn/hmall/item/${productCode}.jpg`,
    skus: [
      {
        id: `${productCode}-DEFAULT`,
        label: `Default / One Size`,
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
