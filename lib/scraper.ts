import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { buildProductImageUrl, isApiProductCode } from "./product-code";

export const UNIQLO_SPU_API_BASE =
  "https://www.uniqlo.cn/data/products/spu/zh_CN/";

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

interface UniqloSpuSummary {
  fullName?: string;
  name?: string;
  code?: string;
  productCode?: string;
  minVaryPrice?: number | string;
  maxVaryPrice?: number | string;
  originPrice?: number | string;
  platformUrl?: string;
  coverImageUrl?: string;
  listImage?: string;
}

interface UniqloSkuRow {
  productId?: string;
  omsSkuCode?: string;
  styleText?: string;
  style?: string;
  sizeText?: string;
  size?: string;
  enabledFlag?: string;
  varyPrice?: number | string;
}

interface UniqloSpuResponse {
  summary?: UniqloSpuSummary;
  rows?: UniqloSkuRow[];
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

  const payload = (await response.json()) as UniqloSpuResponse;
  return mapSpuPayload(productCode, payload);
}

function mapSpuPayload(
  fallbackCode: string,
  payload: UniqloSpuResponse
): Product {
  const summary = payload.summary ?? {};
  const rows = Array.isArray(payload.rows) ? payload.rows : [];

  const skuPrices: number[] = [];
  const skus: ProductSku[] = rows.map((row, index) => {
    const priceCent = yuanToCent(row.varyPrice);
    if (typeof priceCent === "number") {
      skuPrices.push(priceCent);
    }

    return {
      id: row.productId ?? row.omsSkuCode ?? `${fallbackCode}-${index}`,
      label: buildSkuLabel(row, index),
      inStock: (row.enabledFlag ?? "").toUpperCase() === "Y",
      priceCent,
    };
  });

  const listPriceCent =
    yuanToCent(summary.originPrice) ??
    yuanToCent(summary.maxVaryPrice) ??
    undefined;

  const priceCent =
    (skuPrices.length ? Math.min(...skuPrices) : undefined) ??
    yuanToCent(summary.minVaryPrice) ??
    listPriceCent;

  const title =
    summary.fullName?.trim() ||
    summary.name?.trim() ||
    `UNIQLO 商品 ${summary.code ?? fallbackCode}`;

  const inStock = skus.some((sku) => sku.inStock) || undefined;

  const etag = computeEtag({
    title,
    priceCent,
    listPriceCent,
    inStock,
  });

  return {
    productCode: summary.productCode ?? fallbackCode,
    title,
    priceCent,
    listPriceCent,
    inStock,
    imageUrl: pickSummaryImage(summary, fallbackCode),
    skus,
    raw: payload as Prisma.InputJsonValue,
    etag,
  };
}

function pickSummaryImage(
  summary: UniqloSpuSummary | undefined,
  fallbackCode: string
) {
  const primaryCode = summary?.productCode ?? summary?.code ?? fallbackCode;
  const canonicalImage = buildProductImageUrl(primaryCode);
  const secondaryImage =
    summary?.code && summary.code !== primaryCode
      ? buildProductImageUrl(summary.code)
      : undefined;

  const baseCandidates = [
    summary?.platformUrl,
    summary?.coverImageUrl,
    summary?.listImage,
  ];

  const candidates = (
    primaryCode && isApiProductCode(primaryCode)
      ? [canonicalImage, ...baseCandidates, secondaryImage]
      : [...baseCandidates, canonicalImage, secondaryImage]
  )
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return candidates[0];
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

function buildSkuLabel(row: UniqloSkuRow, index: number): string {
  const style = row.styleText?.trim() || row.style?.trim();
  const size = row.sizeText?.trim() || row.size?.trim();

  if (style && size) {
    return `${style} / ${size}`;
  }

  return style ?? size ?? `SKU ${index + 1}`;
}

function hashAsInt(value: string): number {
  const hash = createHash("md5").update(value).digest("hex").slice(0, 8);
  return parseInt(hash, 16);
}
