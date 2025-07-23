import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import RecipesDashboard from "../../components/RecipesDashboard.tsx";
import FeedbackDashboard from "../../components/FeedbackDashboard.tsx";
import { z } from "zod/v4";
import { zodValidator } from "@tanstack/zod-adapter";
import {
  getRecipeDashboardListQueryOpts,
  getRecipeDetailsQueryOpts,
} from "../../queries.ts";

const SearchParams = z.object({
  recipesDashboardPage: z.number().optional(),
  selectedRecipeId: z.string().optional(),
});

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
  validateSearch: zodValidator(SearchParams),
  loaderDeps(opts) {
    return {
      recipesDashboardPage: opts.search.recipesDashboardPage,
      selectedRecipeId: opts.search.selectedRecipeId,
    };
  },
  async loader({ context, deps }) {
    // woher  kommt meine selectedRecipeId
    // woher kommt recipesDashboardPage

    if (deps.selectedRecipeId !== undefined) {
      context.queryClient.ensureQueryData(
        getRecipeDetailsQueryOpts(deps.selectedRecipeId),
      );
    }

    if (deps.recipesDashboardPage !== undefined) {
      context.queryClient.ensureQueryData(
        getRecipeDashboardListQueryOpts(deps.recipesDashboardPage),
      );
    }
    //
  },
});

function Dashboard() {
  return (
    <div className={"Dashboard container mx-auto"}>
      <header>
        <h2>Dashboard</h2>
        <Link to={"/admin/create"} className={"Action"}>
          Add Recipe
        </Link>
      </header>
      <Suspense
        fallback={
          <h2 className={"Loading"}>
            Please wait, while dashboard is loading...
          </h2>
        }
      >
        <RecipesDashboard />
      </Suspense>
      <FeedbackDashboard />
    </div>
  );
}
