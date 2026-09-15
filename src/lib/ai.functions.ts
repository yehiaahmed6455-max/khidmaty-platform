import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamText } from "ai";
import { z } from "zod";

export const DAILY_AI_LIMIT = 15;

const Input = z.object({
  task: z.enum(["summary", "bullets", "skills", "project"]),
  language: z.enum(["ar", "en"]).default("ar"),
  text: z.string().max(4000).default(""),
  jobTitle: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
});

function buildPrompt(data: z.infer<typeof Input>) {
  const lang = data.language === "ar" ? "العربية الفصحى" : "English";
  const common = `اكتب بلغة: ${lang}. لا تخترع أي معلومة غير موجودة. أعد النص النهائي فقط بدون مقدمات أو علامات تنسيق.`;
  switch (data.task) {
    case "summary":
      return `أنت خبير كتابة سير ذاتية متوافقة مع أنظمة ATS. حوّل الكلام التالي إلى نبذة مهنية من 3 إلى 4 أسطر، مركزة على القيمة والمهارات والكلمات المفتاحية المناسبة لمجال "${data.jobTitle}".\n${common}\n\nكلام المستخدم:\n${data.text}`;
    case "bullets":
      return `حوّل وصف المهام التالي لوظيفة "${data.jobTitle}" في "${data.company}" إلى 3-5 نقاط إنجاز احترافية. كل نقطة تبدأ بفعل قوي وتركز على النتيجة والأثر، وتحتوي كلمات مفتاحية مناسبة لأنظمة ATS. أعد كل نقطة في سطر مستقل يبدأ بـ "- " فقط.\n${common}\n\nالوصف:\n${data.text}`;
    case "skills":
      return `اقترح 10 مهارات مناسبة لوظيفة "${data.jobTitle}" (مهارات تقنية ومهنية شائعة في إعلانات الوظائف). أعدها مفصولة بفاصلة فقط في سطر واحد، بدون ترقيم.\n${common}\n\nمهارات المستخدم الحالية: ${data.text}`;
    case "project":
      return `أعد صياغة وصف هذا العمل في معرض أعمال ليكون احترافيًا ومختصرًا (سطرين كحد أقصى) يوضح المشكلة والحل والنتيجة.\n${common}\n\nالوصف:\n${data.text}`;
  }
}

export const generateWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("خدمة الذكاء الاصطناعي غير مهيأة حاليًا.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await supabaseAdmin
      .from("ai_usage")
      .select("count")
      .eq("user_id", context.userId)
      .eq("day", today)
      .maybeSingle();

    const used = (usage as { count?: number } | null)?.count ?? 0;
    if (used >= DAILY_AI_LIMIT) {
      throw new Error(
        `وصلت للحد اليومي (${DAILY_AI_LIMIT} صياغة). تقدر تكمل يدويًا وترجع بكرة للصياغة التلقائية.`,
      );
    }

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    let text: string;
    try {
      const result = streamText({
        model: gateway("google/gemini-3.8-flash"),
        prompt: buildPrompt(data),
      });
      text = (await result.text).trim();
    } catch (error) {
      const status = (error as { statusCode?: number })?.statusCode;
      if (status === 429) throw new Error("الخدمة مزدحمة دلوقتي، جرّب تاني بعد شوية.");
      if (status === 402) throw new Error("رصيد الذكاء الاصطناعي خلص. تقدر تكتب النص يدويًا.");
      throw new Error("تعذّرت الصياغة التلقائية، جرّب تاني أو اكتب النص يدويًا.");
    }

    await supabaseAdmin
      .from("ai_usage")
      .upsert({ user_id: context.userId, day: today, count: used + 1 });

    const remaining = DAILY_AI_LIMIT - used - 1;
    return { text, remaining };
  });
