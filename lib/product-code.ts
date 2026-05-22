import { UNIQLO_API } from "./constants";

// 合法的商品编码至少包含 3 个字符，可由字母、数字、下划线或连字符组成。
const PRODUCT_CODE_REGEX = /^[A-Za-z0-9_-]{3,}$/;
const UNIQLO_HOSTS = new Set(["uniqlo.cn", "www.uniqlo.cn"]);
const UNIQLO_SPU_PATH = UNIQLO_API.SPU_DATA_PATH;

// API 商品编码以 u 开头，后跟数字，例如 u0000000067280。
const API_PRODUCT_CODE_REGEX = /^u\d+$/i;
const UNIQLO_ITEM_IMAGE_BASE = UNIQLO_API.ITEM_IMAGE_BASE_URL;
const UNIQLO_SPU_IMAGE_BASE = UNIQLO_API.SPU_IMAGE_BASE_URL;

export type ParsedProductCode = {
  productCode: string;
  isUrl: boolean;
  kind: "detail" | "api" | "code";
};

/**
 * 解析用户输入的 UNIQLO 链接或商品编码，并返回标准化结果。
 */
export function parseProductCode(input: string): ParsedProductCode {
  const value = input.trim();
  if (!value) {
    throw new Error("请输入商品链接或商品编码");
  }

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (
      ![...UNIQLO_HOSTS].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
      )
    ) {
      throw new Error("仅支持 uniqlo.cn 域名下的商品链接");
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
      throw new Error("无法从链接中提取商品编码");
    }

    return { productCode: detailCode, isUrl: true, kind: "detail" };
  }

  const normalized = stripJsonSuffix(value);
  if (!PRODUCT_CODE_REGEX.test(normalized)) {
    throw new Error("商品编码格式不合法");
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

/**
 * 根据商品编码构建 UNIQLO 官方图片地址。
 */
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
