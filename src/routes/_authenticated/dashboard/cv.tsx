import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Info } from "lucide-react";
import { toast } from "sonner";

import { CvSheet, portfolioPublicUrl } from "@/components/CvSheet";
import { DashboardShell } from "@/components/DashboardShell";
import { useMediaUrl } from "@/components/MediaImg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { fetchMyData, table } from "@/lib/khidmaty";
import { Route as AuthRoute } from "@/routes/_authenticated/route";

export const Route = createFileRoute("/_authenticated/dashboard/cv")({
  head: () => ({
    meta: [
      { title: "السيرة الذاتية — خِدمتي" },
      { name: "description", content: "معاينة سيرتك الذاتية المتوافقة مع أنظمة ATS وتنزيلها PDF." },
      { property: "og:title", content: "السيرة الذاتية — خِدمتي" },
      { property: "og:description", content: "سيرة ذاتية بعمود واحد ونص حقيقي جاهزة للتقديم." },
    ],
  }),
  component: CvPage,
});

function CvPage() {
  const { user } = AuthRoute.useRouteContext();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-data", user.id],
    queryFn: () => fetchMyData(user.id),
  });

  const profile = data?.profile;
  const settings = data?.settings;
  const language = settings?.language ?? "ar";
  const showImage = settings?.show_profile_image_in_pdf ?? false;
  const imageUrl = useMediaUrl(profile?.profile_image_url);

  async function update(patch: Record<string, unknown>) {
    const { error } = await table.from("cv_settings").update(patch).eq("user_id", user.id);
    if (error) {
      toast.error("تعذّر حفظ الإعداد");
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-data", user.id] });
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <p className="text-sm text-muted-foreground">جاري التحميل…</p>
      </DashboardShell>
    );
  }

  if (!profile?.name) {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-semibold">لسه ماأدخلتش بياناتك</p>
          <p className="mt-1 text-sm text-muted-foreground">
            املأ بياناتك الأول عشان نبني السيرة الذاتية.
          </p>
          <Button asChild className="mt-4">
            <Link to="/onboarding">أدخل بياناتي</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="no-print">
        <h1 className="text-2xl font-extrabold md:text-3xl">السيرة الذاتية</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          معاينة مباشرة — التنزيل بينتج ملف PDF بنص حقيقي قابل للتحديد والنسخ.
        </p>

        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">إعدادات الملف</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="lang">لغة السيرة</Label>
              <div className="flex overflow-hidden rounded-lg border" id="lang">
                {(["ar", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => update({ language: l })}
                    className={`px-3 py-1.5 text-sm ${
                      language === l ? "bg-primary text-primary-foreground" : "bg-background"
                    }`}
                  >
                    {l === "ar" ? "العربية" : "English"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="img"
                checked={showImage}
                onCheckedChange={(v) => update({ show_profile_image_in_pdf: v })}
              />
              <Label htmlFor="img">إظهار الصورة الشخصية في الـ PDF</Label>
            </div>
            <Button className="ms-auto" onClick={() => window.print()}>
              <Download className="size-4" /> تنزيل PDF
            </Button>
          </CardContent>
        </Card>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          القالب بعمود واحد، من غير جداول ولا أيقونات، بعناوين أقسام قياسية وتواريخ موحّدة — عشان
          أنظمة فرز المتقدمين (ATS) تقراه صح. الصورة مخفية افتراضيًا من الـ PDF.
        </p>
      </div>

      <div className="mt-6 print-area">
        <CvSheet
          profile={profile}
          experiences={data?.experiences ?? []}
          education={data?.education ?? []}
          skills={data?.skills ?? []}
          language={language}
          showImage={showImage}
          imageUrl={imageUrl}
          portfolioUrl={portfolioPublicUrl(profile.username)}
        />
      </div>
    </DashboardShell>
  );
}
