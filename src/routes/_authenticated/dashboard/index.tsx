import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Eye, FileText, Images, UserRoundPen } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMyData } from "@/lib/khidmaty";
import { Route as AuthRoute } from "@/routes/_authenticated/route";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = AuthRoute.useRouteContext();
  const { data } = useQuery({
    queryKey: ["my-data", user.id],
    queryFn: () => fetchMyData(user.id),
  });

  const profile = data?.profile;
  const publicUrl =
    profile?.username && typeof window !== "undefined"
      ? `${window.location.origin}/${profile.username}`
      : "";

  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold md:text-3xl">
        أهلاً {profile?.name || "بيك"} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        من هنا تظبط بياناتك، وتنزّل سيرتك الذاتية، وتشارك صفحة أعمالك.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <QuickCard
          to="/onboarding"
          icon={UserRoundPen}
          title="تعديل البيانات"
          text="بياناتك الشخصية، الخبرات، التعليم والمهارات."
        />
        <QuickCard
          to="/dashboard/cv"
          icon={FileText}
          title="السيرة الذاتية"
          text="معاينة مباشرة وتنزيل PDF بنص حقيقي."
        />
        <QuickCard
          to="/dashboard/portfolio"
          icon={Images}
          title="البورتفوليو"
          text={`${data?.portfolio.length ?? 0} عمل معروض حاليًا.`}
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="size-4 text-primary" /> مشاهدات صفحتك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold">{profile?.views ?? 0}</p>
            <p className="text-xs text-muted-foreground">إجمالي زيارات صفحتك العامة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">رابط صفحتي العامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.username ? (
            <div className="flex flex-wrap items-center gap-2">
              <code dir="ltr" className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs">
                {publicUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("تم نسخ الرابط");
                }}
              >
                <Copy className="size-4" /> نسخ
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
                  فتح
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              لسه ماخترتش اسم مستخدم لصفحتك.{" "}
              <Link to="/onboarding" className="text-primary underline">
                اختاره من بياناتك
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function QuickCard({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-[var(--shadow-soft)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{text}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
