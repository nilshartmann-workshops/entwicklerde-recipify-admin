import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={"AdminLayout"}>
      <header>
        <nav>
          <Link to={"/admin"}>
            Recipify <span className={"text-black"}> Admin</span>
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
