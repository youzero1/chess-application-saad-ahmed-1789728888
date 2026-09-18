import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

// The app shell: dark plum background, serif header, centered layout.
function RootLayout() {
  return (
    <div className="min-h-screen bg-plum text-lavender">
      <header className="border-b border-violet/30 bg-plum-light/60">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 py-4">
          <h1 className="bg-gradient-to-r from-mint to-violet bg-clip-text font-display text-3xl font-semibold tracking-wide text-transparent">
            Chess
          </h1>
          <p className="hidden text-sm italic text-lavender-dim sm:block">
            A classic game against the computer
          </p>
        </div>
      </header>
      <main className="pb-10">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-plum text-lavender">
      <p className="text-lg">This page does not exist.</p>
      <Link to="/" className="text-sm text-mint underline underline-offset-4">
        Go to the home page
      </Link>
    </div>
  );
}
