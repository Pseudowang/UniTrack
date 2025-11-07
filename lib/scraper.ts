import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";

export const UNIQLO_SPU_API_BASE = "https://www.uniqlo.cn/data/products/spu/zh_CN";

const PRODUCT_CODE_REGEX = /^[A-Za-z0-9_-]{3,}$/;
const UNIQLO_HOSTS = new Set(["uniqlo.cn", "www.uniqlo.cn"]);
const UNIQLO_SPU_PATH = "/data/products/spu/zh_CN/";
const API_PRODUCT_CODE_REGEX = /^u\d+$/i;

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
      { id: "465167-BLACK-M", label: "Black / M", inStock: true, priceCent: 9900 },
      { id: "465167-WHITE-L", label: "White / L", inStock: true, priceCent: 9900 },
      { id: "465167-NAVY-XL", label: "Navy / XL", inStock: false, priceCent: 9900 },
    ],
  },
  "465168": {
    title: "UNIQLO Ultra Light Down Jacket",
    priceCent: 59900,
    listPriceCent: 79900,
    inStock: true,
    imageUrl:
      "https://www.uniqlo.cn/hmall/test/ultra-light-down-jacket.jpg",
    skus: [
      { id: "465168-GREY-M", label: "Grey / M", inStock: true, priceCent: 59900 },
      { id: "465168-GREY-L", label: "Grey / L", inStock: true, priceCent: 59900 },
      { id: "465168-NAVY-S", label: "Navy / S", inStock: false, priceCent: 59900 },
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

export function parseProductCode(input: string): {
  productCode: string;
  isUrl: boolean;
  kind: "detail" | "api" | "code";
} {
  const value = input.trim();
  if (!value) {
    throw new Error("Product code or URL is required");
  }

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (![...UNIQLO_HOSTS].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
      throw new Error("Only uniqlo.cn URLs are supported");
    }

    const apiCode = extractApiProductCode(url);
    if (apiCode) {
      return { productCode: apiCode, isUrl: true, kind: "api" };
    }

    const detailCode =
      url.searchParams.get("productCode") ??
      url.searchParams.get("code") ??
      url.pathname
        .split("/")
        .map((segment) => segment.replace(".html", ""))
        .find((segment) => PRODUCT_CODE_REGEX.test(segment));

    if (!detailCode) {
      throw new Error("Unable to extract product code from URL");
    }

    return { productCode: detailCode, isUrl: true, kind: "detail" };
  }

  const normalized = stripJsonSuffix(value);
  if (!PRODUCT_CODE_REGEX.test(normalized)) {
    throw new Error("Invalid product code format");
  }

  return {
    productCode: normalized,
    isUrl: false,
    kind: isApiProductCode(normalized) ? "api" : "code",
  };
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
        console.warn(`[scraper] failed to fetch ${productCode} from uniqlo.cn`, error);
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

function mapSpuPayload(fallbackCode: string, payload: UniqloSpuResponse): Product {
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
    yuanToCent(summary.originPrice) ?? yuanToCent(summary.maxVaryPrice) ?? undefined;

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

function pickSummaryImage(summary: UniqloSpuSummary | undefined, fallbackCode: string) {
  const candidates = [
    summary?.platformUrl,
    summary?.coverImageUrl,
    summary?.listImage,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (summary?.code) {
    return `https://www.uniqlo.cn/hmall/item/${summary.code}.jpg`;
  }

  if (isApiProductCode(fallbackCode)) {
    return `https://www.uniqlo.cn/hmall/item/${fallbackCode}.jpg`;
  }

  return undefined;
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
  const fallbackPrice = Math.abs(hashAsInt(productCode)) % 80000 + 9900;

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

function extractApiProductCode(url: URL): string | null {
  if (!url.pathname.startsWith(UNIQLO_SPU_PATH)) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const slug = segments[segments.length - 1];
  if (!slug) {
    return null;
  }

  const normalized = stripJsonSuffix(slug);
  return PRODUCT_CODE_REGEX.test(normalized) ? normalized : null;
}

function stripJsonSuffix(value: string): string {
  return value.replace(/\.json$/i, "");
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

function isApiProductCode(value: string): boolean {
  return API_PRODUCT_CODE_REGEX.test(value);
}

function hashAsInt(value: string): number {
  const hash = createHash("md5").update(value).digest("hex").slice(0, 8);
  return parseInt(hash, 16);
}
