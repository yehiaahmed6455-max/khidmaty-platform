import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { CvSheet, portfolioPublicUrl } from "@/components/CvSheet";
import { useMediaUrl } from "@/components/MediaImg";
import { Button } from "@/components/ui/button";
import { fetchPublicData } from "@/lib/khidmaty";

export const Route = createFileRoute("/cv/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `السيرة الذاتية — ${params.username} | خِدمتي` },
      { name: "description", content: `السيرة الذاتية الاحترافية لـ ${params.username}.` },
      { property: "og:title", content: `السيرة الذاتية — ${params.username}` },
      { property: "og:description", content: "سيرة ذاتية متوافقة مع أنظمة ATS بنص حقيقي." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicCv,
});

function PublicCv() {
  const { username } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["public", username],
    queryFn: () => fetchPublicData(username),
  });
  const profile = data?.profile ?? null;
  const imageUrl = useMediaUrl(profile?.profile_image_url);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#print" && profile) {
      window.print();
    }
  }, [profile]);

  if (isLoading) {
    return <p className="p-10 text-center text-sm text-muted-foreground">جاري التحميل…</p>;
  }

  if (!profile) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">الصفحة دي مش موجودة</h1>
        <Link to="/" className="mt-3 inline-block text-primary underline">
          الرجوع للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Link to="/$username" params={{ username }} className="text-sm text-primary underline">
          صفحة الأعمال
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          <Download className="size-4" /> تنزيل PDF
        </Button>
      </div>
      <div className="px-4 print-area">
        <CvSheet
          profile={profile}
          experiences={data?.experiences ?? []}
          education={data?.education ?? []}
          skills={data?.skills ?? []}
          language="ar"
          showImage={false}
          portfolioUrl={portfolioPublicUrl(profile.username)}
        />
      </div>
    </div>
  );
}
