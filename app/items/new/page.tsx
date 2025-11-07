import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewItemForm } from "@/components/forms/new-item-form";
import { auth } from "@/lib/auth";

export default async function NewItemPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>添加追踪商品</CardTitle>
          <CardDescription>
            粘贴 UNIQLO 商品链接、productCode 或 API ID，系统会自动去重并保存。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewItemForm />
        </CardContent>
      </Card>
      <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">支持的输入示例：</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>https://www.uniqlo.cn/product-detail.html?productCode=465167</li>
          <li>https://www.uniqlo.cn/data/products/spu/zh_CN/u0000000065241.json</li>
          <li>u0000000065241</li>
          <li>465167</li>
        </ul>
      </div>
    </div>
  );
}
