import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className={"RootComponent"}>
      <header>
        <nav>
          <Link to={"/"}>Recipify Admin</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
