import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/forms/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建演示账号以体验商品追踪功能。</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        已有账号？{" "}
        <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
          立即登录
        </Link>
      </p>
    </div>
  );
}
