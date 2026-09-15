import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AiButton } from "@/components/AiButton";
import { DashboardShell } from "@/components/DashboardShell";
import { MediaImg } from "@/components/MediaImg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RESERVED_USERNAMES,
  fetchMyData,
  table,
  uploadMedia,
  type Education,
  type Experience,
  type Skill,
} from "@/lib/khidmaty";
import { Route as AuthRoute } from "@/routes/_authenticated/route";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "بياناتي — خِدمتي" },
      { name: "description", content: "أدخل بياناتك الشخصية وخبراتك وتعليمك ومهاراتك." },
      { property: "og:title", content: "بياناتي — خِدمتي" },
      { property: "og:description", content: "أدخل بياناتك ليتحوّل كلامك لسيرة ذاتية احترافية." },
    ],
  }),
  component: Onboarding,
});

type ExpDraft = Omit<Experience, "user_id">;
type EduDraft = Omit<Education, "user_id">;
type SkillDraft = Omit<Skill, "user_id">;

const newId = () => crypto.randomUUID();

function Onboarding() {
  const { user } = AuthRoute.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["my-data", user.id],
    queryFn: () => fetchMyData(user.id),
  });

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    city: "",
    username: "",
    whatsapp: "",
    linkedin: "",
    raw_bio: "",
    generated_summary: "",
    profile_image_url: null as string | null,
  });
  const [experiences, setExperiences] = useState<ExpDraft[]>([]);
  const [education, setEducation] = useState<EduDraft[]>([]);
  const [skills, setSkills] = useState<SkillDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!data || ready) return;
    const p = data.profile;
    setForm({
      name: p?.name ?? "",
      title: p?.title ?? "",
      email: p?.email ?? user.email ?? "",
      phone: p?.phone ?? "",
      city: p?.city ?? "",
      username: p?.username ?? "",
      whatsapp: p?.whatsapp ?? "",
      linkedin: p?.linkedin ?? "",
      raw_bio: p?.raw_bio ?? "",
      generated_summary: p?.generated_summary ?? "",
      profile_image_url: p?.profile_image_url ?? null,
    });
    setExperiences(data.experiences.map(({ user_id: _u, ...rest }) => rest));
    setEducation(data.education.map(({ user_id: _u, ...rest }) => rest));
    setSkills(data.skills.map(({ user_id: _u, ...rest }) => rest));
    setReady(true);
  }, [data, ready, user.email]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    try {
      const path = await uploadMedia(user.id, file);
      set("profile_image_url", path);
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("تعذّر رفع الصورة");
    }
  }

  async function save() {
    const username = form.username.trim().toLowerCase();
    if (!form.name.trim()) {
      toast.error("اكتب اسمك الأول");
      return;
    }
    if (username) {
      if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
        toast.error("اسم المستخدم: حروف إنجليزية وأرقام و - _ فقط (٣ أحرف على الأقل).");
        return;
      }
      if (RESERVED_USERNAMES.includes(username)) {
        toast.error("اسم المستخدم ده محجوز، اختار غيره.");
        return;
      }
    }
    setSaving(true);
    try {
      const { error } = await table
        .from("profiles")
        .update({
          name: form.name,
          title: form.title,
          email: form.email,
          phone: form.phone,
          city: form.city,
          username: username || null,
          whatsapp: form.whatsapp,
          linkedin: form.linkedin,
          raw_bio: form.raw_bio,
          generated_summary: form.generated_summary,
          profile_image_url: form.profile_image_url,
          onboarding_done: true,
        })
        .eq("id", user.id);
      if (error) throw error;

      await Promise.all([
        table.from("experiences").delete().eq("user_id", user.id),
        table.from("education").delete().eq("user_id", user.id),
        table.from("skills").delete().eq("user_id", user.id),
      ]);
      const inserts: Promise<unknown>[] = [];
      if (experiences.length)
        inserts.push(
          table.from("experiences").insert(
            experiences.map((e, i) => ({ ...e, user_id: user.id, order: i })),
          ),
        );
      if (education.length)
        inserts.push(
          table
            .from("education")
            .insert(education.map((e, i) => ({ ...e, user_id: user.id, order: i }))),
        );
      const cleanSkills = skills.filter((s) => s.name.trim());
      if (cleanSkills.length)
        inserts.push(
          table
            .from("skills")
            .insert(cleanSkills.map((s, i) => ({ ...s, user_id: user.id, order: i }))),
        );
      await Promise.all(inserts);

      await qc.invalidateQueries({ queryKey: ["my-data", user.id] });
      toast.success("تم حفظ بياناتك");
      navigate({ to: "/dashboard/cv" });
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.includes("username")
          ? "اسم المستخدم مستخدم بالفعل، اختار غيره."
          : "تعذّر الحفظ، جرّب تاني.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <p className="text-sm text-muted-foreground">جاري التحميل…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold md:text-3xl">بياناتي</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        اكتب كلامك بشكل عادي — تقدر تستخدم زر الصياغة الاحترافية، وتعدّل الناتج زي ما تحب.
      </p>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">المعلومات الشخصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم" value={form.name} onChange={(v) => set("name", v)} />
            <Field
              label="المسمى الوظيفي"
              value={form.title}
              onChange={(v) => set("title", v)}
              placeholder="مصمم جرافيك"
            />
            <Field label="البريد الإلكتروني" value={form.email} onChange={(v) => set("email", v)} ltr />
            <Field label="رقم الهاتف" value={form.phone} onChange={(v) => set("phone", v)} ltr />
            <Field label="المدينة" value={form.city} onChange={(v) => set("city", v)} />
            <Field
              label="اسم المستخدم (رابط صفحتك)"
              value={form.username}
              onChange={(v) => set("username", v)}
              ltr
              placeholder="ahmed-designer"
            />
            <Field label="واتساب" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} ltr />
            <Field label="لينكدإن" value={form.linkedin} onChange={(v) => set("linkedin", v)} ltr />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar">الصورة الشخصية (اختياري)</Label>
            <div className="flex items-center gap-3">
              <MediaImg
                path={form.profile_image_url}
                alt=""
                className="size-14 rounded-full object-cover"
              />
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => onImage(e.target.files?.[0])}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              الصورة بتظهر في صفحتك العامة، ومخفية من ملف الـ PDF افتراضيًا.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="bio">نبذة عنك</Label>
              <AiButton
                label="صياغة احترافية"
                task="summary"
                text={form.raw_bio}
                jobTitle={form.title}
                onResult={(t) => set("generated_summary", t)}
              />
            </div>
            <Textarea
              id="bio"
              rows={3}
              value={form.raw_bio}
              onChange={(e) => set("raw_bio", e.target.value)}
              placeholder="اكتب بكلامك: بشتغل إيه، خبرتك كام سنة، بتعمل إيه كويس…"
            />
            {form.generated_summary ? (
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="summary">النبذة المهنية (تظهر في السيرة الذاتية)</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  value={form.generated_summary}
                  onChange={(e) => set("generated_summary", e.target.value)}
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">الخبرات العملية</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              setExperiences((x) => [
                ...x,
                {
                  id: newId(),
                  job_title: "",
                  company: "",
                  start_date: "",
                  end_date: "",
                  raw_description: "",
                  generated_bullets: [],
                  order: x.length,
                },
              ])
            }
          >
            <Plus className="size-4" /> إضافة خبرة
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">مافيش خبرات مضافة لسه.</p>
          ) : null}
          {experiences.map((exp, i) => (
            <div key={exp.id} className="space-y-3 rounded-xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="المسمى الوظيفي"
                  value={exp.job_title}
                  onChange={(v) => setExperiences(upd(i, { job_title: v }))}
                />
                <Field
                  label="الشركة"
                  value={exp.company}
                  onChange={(v) => setExperiences(upd(i, { company: v }))}
                />
                <Field
                  label="من"
                  value={exp.start_date}
                  onChange={(v) => setExperiences(upd(i, { start_date: v }))}
                  placeholder="2022"
                />
                <Field
                  label="إلى"
                  value={exp.end_date}
                  onChange={(v) => setExperiences(upd(i, { end_date: v }))}
                  placeholder="2024 أو حتى الآن"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>وصف شغلك</Label>
                  <AiButton
                    label="صياغة احترافية"
                    task="bullets"
                    text={exp.raw_description}
                    jobTitle={exp.job_title}
                    company={exp.company}
                    onResult={(t) =>
                      setExperiences(
                        upd(i, {
                          generated_bullets: t
                            .split("\n")
                            .map((l) => l.replace(/^[-•\s]+/, "").trim())
                            .filter(Boolean),
                        }),
                      )
                    }
                  />
                </div>
                <Textarea
                  rows={3}
                  value={exp.raw_description}
                  onChange={(e) => setExperiences(upd(i, { raw_description: e.target.value }))}
                  placeholder="كنت بعمل إيه بالظبط؟"
                />
                {exp.generated_bullets.length > 0 ? (
                  <Textarea
                    rows={4}
                    value={exp.generated_bullets.join("\n")}
                    onChange={(e) =>
                      setExperiences(
                        upd(i, {
                          generated_bullets: e.target.value.split("\n").filter((l) => l.trim()),
                        }),
                      )
                    }
                  />
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setExperiences((x) => x.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4 text-destructive" /> حذف
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">التعليم</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              setEducation((x) => [
                ...x,
                {
                  id: newId(),
                  degree: "",
                  institution: "",
                  start_date: "",
                  end_date: "",
                  order: x.length,
                },
              ])
            }
          >
            <Plus className="size-4" /> إضافة
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {education.length === 0 ? (
            <p className="text-sm text-muted-foreground">مافيش بيانات تعليم لسه.</p>
          ) : null}
          {education.map((edu, i) => (
            <div key={edu.id} className="space-y-3 rounded-xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="المؤهل"
                  value={edu.degree}
                  onChange={(v) => setEducation(updE(i, { degree: v }))}
                />
                <Field
                  label="الجهة التعليمية"
                  value={edu.institution}
                  onChange={(v) => setEducation(updE(i, { institution: v }))}
                />
                <Field
                  label="من"
                  value={edu.start_date}
                  onChange={(v) => setEducation(updE(i, { start_date: v }))}
                  placeholder="2018"
                />
                <Field
                  label="إلى"
                  value={edu.end_date}
                  onChange={(v) => setEducation(updE(i, { end_date: v }))}
                  placeholder="2022"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEducation((x) => x.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4 text-destructive" /> حذف
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">المهارات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="اكتب مهارة واضغط Enter"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (!value) return;
                setSkills((s) => [...s, { id: newId(), name: value, order: s.length }]);
                e.currentTarget.value = "";
              }}
              className="max-w-xs"
            />
            <AiButton
              label="اقترح مهارات"
              task="skills"
              text={`${form.title}\n${form.raw_bio}`}
              jobTitle={form.title}
              onResult={(t) =>
                setSkills((s) => [
                  ...s,
                  ...t
                    .split(/[\n,،]/)
                    .map((x) => x.replace(/^[-•\s]+/, "").trim())
                    .filter(Boolean)
                    .map((name, i) => ({ id: newId(), name, order: s.length + i })),
                ])
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSkills((x) => x.filter((_, j) => j !== i))}
                className="rounded-full bg-secondary px-3 py-1 text-sm hover:line-through"
              >
                {s.name} ×
              </button>
            ))}
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">مافيش مهارات مضافة.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <Button size="lg" disabled={saving} onClick={save}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          حفظ البيانات
        </Button>
      </div>
    </DashboardShell>
  );

  function upd(index: number, patch: Partial<ExpDraft>) {
    return (list: ExpDraft[]) => list.map((it, i) => (i === index ? { ...it, ...patch } : it));
  }
  function updE(index: number, patch: Partial<EduDraft>) {
    return (list: EduDraft[]) => list.map((it, i) => (i === index ? { ...it, ...patch } : it));
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ltr?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        dir={ltr ? "ltr" : undefined}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
