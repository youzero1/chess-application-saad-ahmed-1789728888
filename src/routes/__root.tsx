import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

// The app shell: warm felt background, serif header, centered layout.
function RootLayout() {
  return (
    <div className="min-h-screen bg-felt text-cream">
      <header className="border-b border-gold/20 bg-felt-light/60">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 py-4">
          <h1 className="font-display text-3xl font-semibold tracking-wide text-gold">
            Chess
          </h1>
          <p className="hidden text-sm italic text-cream-dim sm:block">
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-felt text-cream">
      <p className="text-lg">This page does not exist.</p>
      <Link to="/" className="text-sm text-gold underline underline-offset-4">
        Go to the home page
      </Link>
    </div>
  );
}
