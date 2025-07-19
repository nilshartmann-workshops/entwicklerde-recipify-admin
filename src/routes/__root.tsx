import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod/v4";

const QueryParamsSchema = z.object({
  recipesDashboardPage: z.number().optional(),
});

type RecipifyRouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RecipifyRouterContext>()({
  component: RootComponent,
  validateSearch: zodValidator(QueryParamsSchema),
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
