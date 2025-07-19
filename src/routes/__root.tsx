import {
  createRootRoute,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod/v4";

const QueryParamsSchema = z.object({
  recipesDashboardPage: z.number().optional(),
});

export const Route = createRootRoute({
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
