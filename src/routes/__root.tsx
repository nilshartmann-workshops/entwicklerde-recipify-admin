import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className={"flex min-h-svh flex-col"}>
      <div className={"container mx-auto h-16"}>
        <div className={"flex h-full items-center justify-between"}>
          <Link
            to={"/"}
            className={
              "cursor-pointer text-gray-900 transition-all duration-500 ease-in-out hover:text-gray-400"
            }
          >
            <i className="fa-solid fa-house"></i>
          </Link>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
