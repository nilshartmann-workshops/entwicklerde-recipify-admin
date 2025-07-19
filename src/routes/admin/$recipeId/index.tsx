import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import RecipeForm from "../../../components/ReceipeForm.tsx";
import { getRecipeQueryOpts } from "../../../queries.ts";

export const Route = createFileRoute("/admin/$recipeId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { recipeId } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(getRecipeQueryOpts(recipeId));

  return (
    <div>
      <RecipeForm existingRecipe={recipe} />
    </div>
  );
}
