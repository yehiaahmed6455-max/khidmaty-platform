import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AiButton } from "@/components/AiButton";
import { MediaImg } from "@/components/MediaImg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { table, uploadMedia, type PortfolioItem } from "@/lib/khidmaty";

export function PortfolioManager({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["portfolio", userId],
    queryFn: async (): Promise<PortfolioItem[]> => {
      const { data } = await table.from("portfolio_items").select("*").eq("user_id", userId).order("order");
      return data ?? [];
    },
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["portfolio", userId] });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await table.from("portfolio_items").delete().eq("id", id);
    },
    onSuccess: () => {
      toast.success("تم حذف العمل");
      refresh();
    },
  });

  async function move(item: PortfolioItem, dir: -1 | 1) {
    const index = items.findIndex((i) => i.id === item.id);
    const other = items[index + dir];
    if (!other) return;
    await table.from("portfolio_items").update({ order: other.order }).eq("id", item.id);
    await table.from("portfolio_items").update({ order: item.order }).eq("id", other.id);
    refresh();
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("اكتب عنوان العمل");
      return;
    }
    setUploading(true);
    try {
      const paths: string[] = [];
      for (const file of files) paths.push(await uploadMedia(userId, file));
      const { error } = await table.from("portfolio_items").insert({
        user_id: userId,
        title,
        description,
        category,
        external_link: link,
        images: paths,
        order: items.length,
      });
      if (error) throw error;
      setTitle("");
      setCategory("");
      setDescription("");
      setLink("");
      setFiles([]);
      toast.success("تمت إضافة العمل");
      refresh();
    } catch {
      toast.error("تعذّرت إضافة العمل، جرّب تاني.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={addItem}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-title">عنوان العمل</Label>
                <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-cat">التصنيف (اختياري)</Label>
                <Input
                  id="p-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="تصميم هوية، تصوير، برمجة…"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="p-desc">وصف مختصر</Label>
                <AiButton
                  label="صياغة احترافية"
                  task="project"
                  text={description}
                  onResult={setDescription}
                />
              </div>
              <Textarea
                id="p-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-link">رابط خارجي (اختياري)</Label>
                <Input
                  id="p-link"
                  dir="ltr"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-img">صور العمل</Label>
                <Input
                  id="p-img"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </div>
            </div>
            <Button disabled={uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              إضافة العمل
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">جاري التحميل…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-semibold">لسه مافيش أعمال معروضة</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ابدأ بأول عمل ليك — حتى صورة واحدة بتفرق كتير مع أصحاب الشغل.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden pt-0">
              <MediaImg path={item.images[0] ?? null} alt={item.title} className="h-40 w-full object-cover" />
              <CardContent className="space-y-2">
                <p className="font-bold">{item.title}</p>
                {item.category ? (
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                ) : null}
                <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => move(item, -1)}
                    aria-label="تحريك لأعلى"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={index === items.length - 1}
                    onClick={() => move(item, 1)}
                    aria-label="تحريك لأسفل"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove.mutate(item.id)}
                    aria-label="حذف"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
