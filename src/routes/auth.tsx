import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "الدخول إلى خِدمتي" },
      { name: "description", content: "سجّل دخولك أو أنشئ حسابك لبدء سيرتك الذاتية وبورتفوليو أعمالك." },
      { property: "og:title", content: "الدخول إلى خِدمتي" },
      { property: "og:description", content: "سجّل دخولك أو أنشئ حسابك على خِدمتي." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { name } },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر إتمام العملية");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("تعذّر الدخول بحساب جوجل");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="surface-gradient flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-[var(--shadow-soft)]">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-2 text-lg font-extrabold text-primary">
            خِدمتي
          </Link>
          <CardTitle className="text-2xl">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription>
            {mode === "login" ? "أهلاً بعودتك، كمّل من حيث وقفت." : "دقيقة واحدة وتبدأ سيرتك الذاتية."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <p className="rounded-lg bg-secondary p-4 text-center text-sm">
              بعتنا لك رسالة تأكيد على <b>{email}</b>. افتح الرسالة واضغط على رابط التأكيد عشان
              تدخل حسابك.
            </p>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={google} type="button">
                المتابعة بحساب جوجل
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> أو <span className="h-px flex-1 bg-border" />
              </div>
              <form className="space-y-3" onSubmit={submit}>
                {mode === "signup" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    dir="ltr"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? "لحظة…" : mode === "login" ? "دخول" : "إنشاء الحساب"}
                </Button>
              </form>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "معندكش حساب؟ سجّل دلوقتي" : "عندك حساب؟ سجّل دخولك"}
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
