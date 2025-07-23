import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className={"AdminLayout"}>
      <div className={"top"}>
        <Link to={"/"}>🏡</Link>
      </div>
      <header>
        <nav>
          <Link to={"/admin"}>Recipify Admin</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
