export const UNIQLO_API = {
  PRODUCT_INFO_BASE_URL: "https://www.uniqlo.cn/data/products/prodInfo/zh_CN",
  SPU_DATA_PATH: "/data/products/spu/zh_CN/",
  ITEM_IMAGE_BASE_URL: "https://www.uniqlo.cn/hmall/item",
  SPU_IMAGE_BASE_URL: "https://www.uniqlo.cn/hmall/test",
} as const;

export const CRAWLER_CONFIG = {
  DELAY_MIN_MS: 500,
  DELAY_MAX_MS: 1500,
} as const;

export const TOAST_CONFIG = {
  LIMIT: 1,
  REMOVE_DELAY_MS: 1000000,
} as const;

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
