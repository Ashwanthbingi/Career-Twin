import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { AmbientBackground } from "../components/AmbientBackground";
import { ThreeBackground } from "../components/ThreeBackground";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-black tracking-tighter text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">This route is outside the simulation.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-foreground"
        >
          Return to base
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Signal lost</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something disrupted the neural link.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-foreground"
          >
            Reconnect
          </button>
          <a href="/" className="rounded-full glass px-5 py-2 text-sm font-medium">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Twinos — Smart Career Digital Twin" },
      {
        name: "description",
        content:
          "Mirror your career, simulate every future, and build the roadmap that gets you there.",
      },
      { property: "og:title", content: "Twinos — Smart Career Digital Twin" },
      { property: "og:description", content: "An AI digital twin of your professional self." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen font-body overflow-x-clip">
        <ThreeBackground />
        <AmbientBackground />
        <Nav />
        <Outlet />
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
