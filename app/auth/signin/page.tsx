import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/forms/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>使用邮箱与密码登录 Unitrack 演示。</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        还没有账号？{" "}
        <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
          前往注册
        </Link>
      </p>
    </div>
  );
}
