import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) return { user: data.user };
    // Guest entry: no sign-in screen, a private session is created automatically.
    const { data: anon, error } = await supabase.auth.signInAnonymously();
    if (error || !anon.user) throw redirect({ to: "/auth" });
    return { user: anon.user };
  },
  component: () => <Outlet />,
});
