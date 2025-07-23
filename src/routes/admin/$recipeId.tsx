import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRecipeDetailsQueryOpts } from "../../queries.ts";
import RecipeForm from "../../components/RecipeForm.tsx";

export const Route = createFileRoute("/admin/$recipeId")({
  pendingComponent: () => <h2 className={"Loading"}>Loading Recipe</h2>,
  component: RouteComponent,
  async loader({ context, params }) {
    console.log("Loading Recipe", params.recipeId);
    context.queryClient.ensureQueryData(
      getRecipeDetailsQueryOpts(params.recipeId),
    );
  },
});

function RouteComponent() {
  const { recipeId } = Route.useParams();

  const { data: recipe } = useSuspenseQuery(
    getRecipeDetailsQueryOpts(recipeId),
  );

  return <RecipeForm existingRecipe={recipe} />;
}
