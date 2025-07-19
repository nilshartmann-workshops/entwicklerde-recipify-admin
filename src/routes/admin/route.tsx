import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { meQueryOpts, useLogout } from "../../queries.ts";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  async beforeLoad({ context, location }) {
    const me = await context.queryClient.fetchQuery(meQueryOpts());
    console.log("me", me);

    if (!me) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
});

function RouteComponent() {
  const handleLogout = useLogout();
  const me = useSuspenseQuery(meQueryOpts());

  return (
    <div className={"AdminLayout"}>
      <header>
        <nav>
          <Link to={"/admin"}>
            Recipify <span className={"text-black"}> Admin</span>
          </Link>
          <button onClick={() => handleLogout()}>
            {me.data?.fullname} Logout
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
