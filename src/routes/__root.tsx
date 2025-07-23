import * as React from "react";
import {
  Outlet,
  createRootRoute,
  retainSearchParams,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
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
