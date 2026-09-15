import { supabase } from "@/integrations/supabase/client";

export const RESERVED_USERNAMES = [
  "dashboard",
  "admin",
  "login",
  "signup",
  "onboarding",
  "settings",
  "api",
  "cv",
  "portfolio",
  "auth",
  "p",
];

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  title: string;
  profile_image_url: string | null;
  username: string | null;
  raw_bio: string;
  generated_summary: string;
  whatsapp: string;
  linkedin: string;
  views: number;
  onboarding_done: boolean;
};

export type Experience = {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  start_date: string;
  end_date: string;
  raw_description: string;
  generated_bullets: string[];
  order: number;
};

export type Education = {
  id: string;
  user_id: string;
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
  order: number;
};

export type Skill = { id: string; user_id: string; name: string; order: number };

export type PortfolioItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  external_link: string;
  order: number;
};

export type CvSettings = {
  user_id: string;
  language: "ar" | "en";
  show_profile_image_in_pdf: boolean;
  template_style: string;
};

export type FullData = {
  profile: Profile | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  portfolio: PortfolioItem[];
  settings: CvSettings | null;
};

const db = supabase as never as {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ error: unknown }>;
};

export async function fetchMyData(userId: string): Promise<FullData> {
  const [profile, experiences, education, skills, portfolio, settings] = await Promise.all([
    db.from("profiles").select("*").eq("id", userId).maybeSingle(),
    db.from("experiences").select("*").eq("user_id", userId).order("order"),
    db.from("education").select("*").eq("user_id", userId).order("order"),
    db.from("skills").select("*").eq("user_id", userId).order("order"),
    db.from("portfolio_items").select("*").eq("user_id", userId).order("order"),
    db.from("cv_settings").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    profile: profile.data ?? null,
    experiences: experiences.data ?? [],
    education: education.data ?? [],
    skills: skills.data ?? [],
    portfolio: portfolio.data ?? [],
    settings: settings.data ?? null,
  };
}

export async function fetchPublicData(username: string): Promise<FullData> {
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (!profile) {
    return {
      profile: null,
      experiences: [],
      education: [],
      skills: [],
      portfolio: [],
      settings: null,
    };
  }
  const [experiences, education, skills, portfolio] = await Promise.all([
    db.from("experiences").select("*").eq("user_id", profile.id).order("order"),
    db.from("education").select("*").eq("user_id", profile.id).order("order"),
    db.from("skills").select("*").eq("user_id", profile.id).order("order"),
    db.from("portfolio_items").select("*").eq("user_id", profile.id).order("order"),
  ]);
  return {
    profile,
    experiences: experiences.data ?? [],
    education: education.data ?? [],
    skills: skills.data ?? [],
    portfolio: portfolio.data ?? [],
    settings: null,
  };
}

export async function countProfileView(username: string) {
  await db.rpc("increment_profile_views", { _username: username });
}

export async function uploadMedia(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  return `${base ?? ""}/storage/v1/object/public/media/${path}`;
}

/** Signed URL so private-bucket images render for visitors too. */
export async function signedMediaUrl(path: string | null | undefined): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? "";
}

export const table = db;
