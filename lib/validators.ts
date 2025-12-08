
// TypeScript 模式声明和验证库(Schema Validation Library)
import { z } from "zod";

// 解析出 productCode 的工具函数
import { parseProductCode } from "./product-code";

export const trackedItemPayloadSchema = z.object({
  value: z
    .string() //必须是字符串
    .trim() // 去除首尾空格
    .min(1, "请输入商品链接或 productCode") // 最小长度
    .refine ((val) => {   
      try {
        parseProductCode(val);
        return true;
      } catch {
        return false;
      }
    }, "仅支持 uniqlo.cn 商品链接或合法 productCode"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("请输入合法邮箱"),
    password: z.string().min(6, "密码至少 6 位"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("请输入合法邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});
