import { useQuery } from "@tanstack/react-query";
import { signedMediaUrl } from "@/lib/khidmaty";

export function useMediaUrl(path?: string | null) {
  const { data } = useQuery({
    queryKey: ["media", path],
    queryFn: () => signedMediaUrl(path),
    enabled: !!path,
    staleTime: 1000 * 60 * 60,
  });
  return data ?? "";
}

export function MediaImg({
  path,
  alt,
  className,
}: {
  path?: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = useMediaUrl(path);
  if (!url) return <div className={`bg-secondary ${className ?? ""}`} aria-hidden />;
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
