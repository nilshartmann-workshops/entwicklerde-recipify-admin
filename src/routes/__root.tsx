import * as React from "react";
import {
  Outlet,
  createRootRoute,
  retainSearchParams,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
  search: {
    middlewares: [retainSearchParams(true)],
  },
});

function RootComponent() {
  return (
    <div className={"RootComponent"}>
      <Outlet />
    </div>
  );
}
