import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/DashboardShell";
import { PortfolioManager } from "@/components/PortfolioManager";
import { Route as AuthRoute } from "@/routes/_authenticated/route";

export const Route = createFileRoute("/_authenticated/dashboard/portfolio")({
  head: () => ({
    meta: [
      { title: "البورتفوليو — خِدمتي" },
      { name: "description", content: "أضف أعمالك وصورها ورتّبها في صفحة عرض احترافية." },
      { property: "og:title", content: "البورتفوليو — خِدمتي" },
      { property: "og:description", content: "أضف أعمالك وصورها ورتّبها في صفحة عرض احترافية." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { user } = AuthRoute.useRouteContext();
  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold md:text-3xl">البورتفوليو</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        كل عمل بتضيفه بيظهر في صفحتك العامة. الصور اختيارية — الصفحة شغالة من غيرها عادي.
      </p>
      <PortfolioManager userId={user.id} />
    </DashboardShell>
  );
}
