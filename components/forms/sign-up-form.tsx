"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema } from "@/lib/validators";

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse(formState);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "输入不合法");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const message = await response
          .json()
          .catch(() => ({ error: "注册失败" }));
        setError(message.error ?? "注册失败");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push("/auth/signin");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          value={formState.email}
          onChange={(event) =>
            setFormState((state) => ({ ...state, email: event.target.value }))
          }
          placeholder="demo@unitrack.local"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          value={formState.password}
          onChange={(event) =>
            setFormState((state) => ({ ...state, password: event.target.value }))
          }
          minLength={6}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">确认密码</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formState.confirmPassword}
          onChange={(event) =>
            setFormState((state) => ({
              ...state,
              confirmPassword: event.target.value,
            }))
          }
          minLength={6}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="cursor-pointer">
        {pending ? "注册中..." : "注册"}
      </Button>
    </form>
  );
}
