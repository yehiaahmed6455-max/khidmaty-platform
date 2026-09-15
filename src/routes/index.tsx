import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, PenLine, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-mockup.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "خِدمتي — سيرة ذاتية متوافقة مع ATS وبورتفوليو في دقائق" },
      {
        name: "description",
        content:
          "اكتب بياناتك بكلامك العادي، ونحوّلها لسيرة ذاتية احترافية متوافقة مع أنظمة التوظيف وصفحة أعمال ليها رابط تشاركه.",
      },
      { property: "og:title", content: "خِدمتي — سيرة ذاتية ATS وبورتفوليو احترافي" },
      {
        property: "og:description",
        content: "سيرة ذاتية نص حقيقي بعمود واحد + صفحة أعمال جاهزة للمشاركة.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-xl font-extrabold text-primary">خِدمتي</span>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">دخول</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">ابدأ مجانًا</Link>
          </Button>
        </div>
      </header>

      <section className="surface-gradient">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-card)]">
              <CheckCircle2 className="size-3.5" /> متوافقة مع أنظمة فرز المتقدمين ATS
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold md:text-5xl">
              حوّل بياناتك لسيرة ذاتية احترافية وبورتفوليو مميز — في دقائق
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              اكتب عن نفسك بكلامك العادي، والباقي علينا: صياغة احترافية، سيرة ذاتية جاهزة
              للتحميل بنص حقيقي، وصفحة أعمال ليها رابط تبعته لأي حد.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">ابدأ مجانًا</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">عندي حساب</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              مجاني بالكامل — الصياغة التلقائية اختيارية وبحد يومي.
            </p>
          </div>
          <img
            src={heroMockup}
            alt="نموذج لسيرة ذاتية بعمود واحد بجانب صفحة معرض أعمال"
            width={1280}
            height={960}
            className="rounded-2xl border shadow-[var(--shadow-soft)]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">خطوتين بس</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: PenLine,
              title: "١. اكتب بياناتك",
              text: "خبراتك وتعليمك ومهاراتك بكلامك العادي — من غير ما تفكر في الصياغة.",
            },
            {
              icon: FileText,
              title: "٢. سيرة ذاتية جاهزة",
              text: "عمود واحد، بدون جداول ولا صور، نص قابل للتحديد والنسخ عشان أنظمة التوظيف تقراه.",
            },
            {
              icon: Share2,
              title: "٣. رابط أعمالك",
              text: "صفحة عرض احترافية بصورك ومشاريعك، تبعت لينكها لصاحب العمل أو على السوشيال.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">ليه سيرتك هنا بتعدّي الفلاتر؟</h2>
          <ul className="mx-auto mt-6 grid max-w-2xl gap-3 text-start text-sm md:grid-cols-2">
            {[
              "عمود واحد يُقرأ من فوق لتحت",
              "بدون جداول أو أعمدة جانبية",
              "بدون أيقونات داخل نص السيرة",
              "عناوين أقسام قياسية واضحة",
              "خط بسيط وتواريخ بصيغة موحّدة",
              "نص حقيقي قابل للتحديد — مش صورة",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">ابدأ مجانًا</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        خِدمتي — أداة شخصية لبناء سيرتك الذاتية ومعرض أعمالك.
      </footer>
    </div>
  );
}
