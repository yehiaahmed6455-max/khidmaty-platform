import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  ExternalLink,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { MediaImg, useMediaUrl } from "@/components/MediaImg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { countProfileView, fetchPublicData } from "@/lib/khidmaty";

export const Route = createFileRoute("/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} | خِدمتي` },
      { name: "description", content: `صفحة الأعمال والسيرة الذاتية لـ ${params.username}.` },
      { property: "og:title", content: `${params.username} — صفحة الأعمال` },
      { property: "og:description", content: "معرض أعمال احترافي مع سيرة ذاتية جاهزة للتنزيل." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfile,
});

function PublicProfile() {
  const { username } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["public", username],
    queryFn: () => fetchPublicData(username),
  });
  const profile = data?.profile ?? null;
  const portfolio = data?.portfolio ?? [];
  const imageUrl = useMediaUrl(profile?.profile_image_url);

  useEffect(() => {
    if (profile) void countProfileView(username);
  }, [profile, username]);

  if (isLoading) {
    return <p className="p-10 text-center text-sm text-muted-foreground">جاري التحميل…</p>;
  }

  if (!profile) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">الصفحة دي مش موجودة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          اتأكد من الرابط، أو أنشئ صفحتك الخاصة مجانًا.
        </p>
        <Link to="/" className="mt-3 inline-block text-primary underline">
          الرجوع للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-10 text-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`صورة ${profile.name}`}
              className="size-24 rounded-full border object-cover"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full border bg-secondary text-2xl font-bold text-muted-foreground">
              {profile.name?.charAt(0) ?? "؟"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {profile.title && <p className="mt-1 text-muted-foreground">{profile.title}</p>}
            {profile.city && (
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {profile.city}
              </p>
            )}
          </div>
          {(profile.generated_summary || profile.raw_bio) && (
            <p className="max-w-2xl text-sm leading-7 text-foreground/90">
              {profile.generated_summary || profile.raw_bio}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.email && (
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${profile.email}`}>
                  <Mail className="size-4" /> بريد
                </a>
              </Button>
            )}
            {profile.phone && (
              <Button asChild variant="outline" size="sm">
                <a href={`tel:${profile.phone}`}>
                  <Phone className="size-4" /> اتصال
                </a>
              </Button>
            )}
            {profile.whatsapp && (
              <Button asChild variant="outline" size="sm">
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" /> واتساب
                </a>
              </Button>
            )}
            {profile.linkedin && (
              <Button asChild variant="outline" size="sm">
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin className="size-4" /> لينكدإن
                </a>
              </Button>
            )}
            <Button asChild size="sm">
              <Link to="/cv/$username" params={{ username }}>
                <Download className="size-4" /> تنزيل السيرة الذاتية
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="mb-6 text-xl font-bold">الأعمال</h2>
        {portfolio.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              لم يتم إضافة أعمال بعد — تفضل بزيارة الصفحة لاحقًا.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {portfolio.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.images.length > 0 && (
                  <MediaImg
                    path={item.images[0]}
                    alt={item.title}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.category && (
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      )}
                    </div>
                    {item.external_link && (
                      <a
                        href={item.external_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary"
                        aria-label={`فتح ${item.title}`}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-foreground/80">{item.description}</p>
                  )}
                  {item.images.length > 1 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {item.images.slice(1).map((img) => (
                        <MediaImg
                          key={img}
                          path={img}
                          alt={item.title}
                          className="aspect-square w-full rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          أنشئ صفحتك وسيرتك الذاتية مجانًا على خِدمتي
        </Link>
      </footer>
    </div>
  );
}
