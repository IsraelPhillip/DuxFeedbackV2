import { createRouter, createRoute, createRootRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Landing } from "./pages/Landing";
import { FeedbackPage } from "./pages/FeedbackPage";
import { AuthPage } from "./pages/AuthPage";
import { SuccessPage } from "./pages/SuccessPage";
import { QrPage } from "./pages/QrPage";
import { AdminPage } from "./pages/AdminPage";
import { supabase } from "./integrations/supabase/client";

/* ── Root ──────────────────────────────────────────────── */
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  ),
});

/* ── Public routes ─────────────────────────────────────── */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const feedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feedback",
  component: FeedbackPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/success",
  component: SuccessPage,
});

const qrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/qr",
  component: QrPage,
});

/* ── Authenticated layout ──────────────────────────────── */
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});

const adminRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/admin",
  component: AdminPage,
});

/* ── Route tree ────────────────────────────────────────── */
const routeTree = rootRoute.addChildren([
  indexRoute,
  feedbackRoute,
  authRoute,
  successRoute,
  qrRoute,
  authenticatedRoute.addChildren([adminRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
