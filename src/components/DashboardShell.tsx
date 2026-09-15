import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/dashboard", label: "لوحة التحكم" },
  { to: "/onboarding", label: "بياناتي" },
  { to: "/dashboard/cv", label: "السيرة الذاتية" },
  { to: "/dashboard/portfolio", label: "البورتفوليو" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-extrabold text-primary">
            خِدمتي
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:font-semibold [&.active]:text-foreground"
                activeOptions={{ exact: l.to === "/dashboard" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> خروج
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
