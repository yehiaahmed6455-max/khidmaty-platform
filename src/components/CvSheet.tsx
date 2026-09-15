import type { Education, Experience, PortfolioItem, Profile, Skill } from "@/lib/khidmaty";

type Props = {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  language: "ar" | "en";
  showImage: boolean;
  imageUrl?: string;
  portfolioUrl?: string;
};

const L = {
  ar: {
    summary: "نبذة مهنية",
    experience: "الخبرات العملية",
    education: "التعليم",
    skills: "المهارات",
    portfolio: "معرض الأعمال",
  },
  en: {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    portfolio: "Portfolio",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2
        className="border-b pb-1 text-[15px] font-bold tracking-wide uppercase"
        style={{ borderColor: "#999", color: "#111" }}
      >
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export function CvSheet({
  profile,
  experiences,
  education,
  skills,
  language,
  showImage,
  imageUrl,
  portfolioUrl,
}: Props) {
  const t = L[language];
  const contact = [profile.email, profile.phone, profile.city, portfolioUrl]
    .filter(Boolean)
    .join(" | ");

  return (
    <article
      className="cv-sheet mx-auto w-full max-w-[820px] rounded-xl border bg-white p-8 shadow-sm md:p-12"
      dir={language === "ar" ? "rtl" : "ltr"}
      lang={language}
    >
      {showImage && imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="mb-4 size-24 rounded-full object-cover"
          style={{ marginInline: "auto" }}
        />
      ) : null}

      <header className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#111" }}>
          {profile.name}
        </h1>
        {profile.title ? (
          <p className="mt-1 text-[15px]" style={{ color: "#333" }}>
            {profile.title}
          </p>
        ) : null}
        {contact ? (
          <p className="mt-1 text-[13px]" style={{ color: "#333" }}>
            {contact}
          </p>
        ) : null}
      </header>

      {profile.generated_summary || profile.raw_bio ? (
        <Section title={t.summary}>
          <p className="text-[13.5px] whitespace-pre-line" style={{ color: "#222" }}>
            {profile.generated_summary || profile.raw_bio}
          </p>
        </Section>
      ) : null}

      {experiences.length > 0 ? (
        <Section title={t.experience}>
          {experiences.map((exp) => {
            const bullets =
              exp.generated_bullets.length > 0
                ? exp.generated_bullets
                : exp.raw_description
                    .split("\n")
                    .map((line) => line.replace(/^[-•\s]+/, "").trim())
                    .filter(Boolean);
            return (
              <div key={exp.id}>
                <p className="text-[14px] font-bold" style={{ color: "#111" }}>
                  {exp.job_title}
                  {exp.company ? ` — ${exp.company}` : ""}
                </p>
                <p className="text-[12.5px]" style={{ color: "#444" }}>
                  {exp.start_date} - {exp.end_date}
                </p>
                <ul className="mt-1 space-y-0.5 ps-5" style={{ listStyleType: "disc" }}>
                  {bullets.map((b, i) => (
                    <li key={i} className="text-[13.5px]" style={{ color: "#222" }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section title={t.education}>
          {education.map((edu) => (
            <div key={edu.id}>
              <p className="text-[14px] font-bold" style={{ color: "#111" }}>
                {edu.degree}
                {edu.institution ? ` — ${edu.institution}` : ""}
              </p>
              <p className="text-[12.5px]" style={{ color: "#444" }}>
                {edu.start_date} - {edu.end_date}
              </p>
            </div>
          ))}
        </Section>
      ) : null}

      {skills.length > 0 ? (
        <Section title={t.skills}>
          <p className="text-[13.5px]" style={{ color: "#222" }}>
            {skills.map((s) => s.name).join(" • ")}
          </p>
        </Section>
      ) : null}
    </article>
  );
}

export function portfolioPublicUrl(username: string | null | undefined) {
  if (!username) return "";
  if (typeof window === "undefined") return `/${username}`;
  return `${window.location.origin}/${username}`;
}

export type { PortfolioItem };
