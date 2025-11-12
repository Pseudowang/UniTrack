const PRODUCT_CODE_REGEX = /^[A-Za-z0-9_-]{3,}$/;
const UNIQLO_HOSTS = new Set(["uniqlo.cn", "www.uniqlo.cn"]);
const UNIQLO_SPU_PATH = "/data/products/spu/zh_CN/";
const API_PRODUCT_CODE_REGEX = /^u\d+$/i;

const UNIQLO_ITEM_IMAGE_BASE = "https://www.uniqlo.cn/hmall/item";
const UNIQLO_SPU_IMAGE_BASE = "https://www.uniqlo.cn/hmall/test";

export type ParsedProductCode = {
  productCode: string;
  isUrl: boolean;
  kind: "detail" | "api" | "code";
};

export function parseProductCode(input: string): ParsedProductCode {
  const value = input.trim();
  if (!value) {
    throw new Error("Product code or URL is required");
  }

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (
      ![...UNIQLO_HOSTS].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
      )
    ) {
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

export function isApiProductCode(value: string): boolean {
  return API_PRODUCT_CODE_REGEX.test(value);
}

export function buildProductImageUrl(
  productCode?: string | null
): string | undefined {
  if (!productCode) {
    return undefined;
  }

  const normalized = productCode.trim();
  if (!normalized) {
    return undefined;
  }

  if (isApiProductCode(normalized)) {
    return `${UNIQLO_SPU_IMAGE_BASE}/${normalized.toLowerCase()}/main/first/1000/1.jpg`;
  }

  return `${UNIQLO_ITEM_IMAGE_BASE}/${normalized}.jpg`;
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
