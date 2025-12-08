// 正则表达式 字符串必须由大小写s字母、数字、下划线或连字符组成，且长度至少为 3 个字符。
// 一个完整的商品 api url 为 https://www.uniqlo.cn/data/products/spu/zh_CN/u0000000067280.json
const PRODUCT_CODE_REGEX = /^[A-Za-z0-9_-]{3,}$/;

// 在笔记Map 和 Set 中讲解, 创建一个 iterable Object
const UNIQLO_HOSTS = new Set(["uniqlo.cn", "www.uniqlo.cn"]);
const UNIQLO_SPU_PATH = "/data/products/spu/zh_CN/";

// 匹配product code: u开头 \d匹配素质 +指的是前面的数字至少出现一次, $为结束, i表示忽略大小写
const API_PRODUCT_CODE_REGEX = /^u\d+$/i;

// 商品详情页图片
const UNIQLO_ITEM_IMAGE_BASE = "https://www.uniqlo.cn/hmall/item";

// src="https://www.uniqlo.cn/hmall/test/u0000000067280/main/first/1000/1.jpg"
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
    // 笔记URL 对象中有写
    const url = new URL(value);
    if (
      // 如果hostname不包含 uniqlo.cn
      ![...UNIQLO_HOSTS].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
      )
    ) {
      throw new Error("Only uniqlo.cn URLs are supported");
    }

    // extractApiProductCode(url) 提取商品编码 0000000067280
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

  // .filter(Boolean) 去除空字符串
  const segments = url.pathname.split("/").filter(Boolean);
  // 提取最后的 u00000000067280.json
  const slug = segments[segments.length - 1];
  if (!slug) {
    return null;
  }
  // 返回 u00000000067280
  const normalized = stripJsonSuffix(slug);
  return PRODUCT_CODE_REGEX.test(normalized) ? normalized : null;
}

function stripJsonSuffix(value: string): string {
  return value.replace(/\.json$/i, "");
}
