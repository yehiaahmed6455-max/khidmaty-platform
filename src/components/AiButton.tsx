import { useState } from "react";
import { Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { generateWithAi } from "@/lib/ai.functions";

type Props = {
  label: string;
  task: "summary" | "bullets" | "skills" | "project";
  language?: "ar" | "en";
  text: string;
  jobTitle?: string;
  company?: string;
  onResult: (text: string) => void;
};

export function AiButton({
  label,
  task,
  language = "ar",
  text,
  jobTitle = "",
  company = "",
  onResult,
}: Props) {
  const run = useServerFn(generateWithAi);
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={loading}
      onClick={async () => {
        if (!text.trim()) {
          toast.error("اكتب كلامك الأول، وبعدين اضغط الصياغة الاحترافية.");
          return;
        }
        setLoading(true);
        try {
          const res = await run({ data: { task, language, text, jobTitle, company } });
          onResult(res.text);
          toast.success(`تمت الصياغة — باقي لك ${res.remaining} مرة النهارده`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "تعذّرت الصياغة، جرّب تاني.");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> جاري الصياغة…
        </>
      ) : (
        <>
          <PenLine className="size-4" /> {label}
        </>
      )}
    </Button>
  );
}
