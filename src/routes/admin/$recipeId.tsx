import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRecipeDetailsQueryOpts } from "../../queries.ts";
import RecipeForm from "../../components/RecipeForm.tsx";

export const Route = createFileRoute("/admin/$recipeId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { recipeId } = Route.useParams();

  const { data: recipe } = useSuspenseQuery(
    getRecipeDetailsQueryOpts(recipeId),
  );

  return <RecipeForm existingRecipe={recipe} />;
}
