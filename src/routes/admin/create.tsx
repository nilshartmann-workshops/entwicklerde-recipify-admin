import { createFileRoute } from "@tanstack/react-router";
import RecipeForm from "../../components/RecipeForm.tsx";

export const Route = createFileRoute("/admin/create")({
  component: CreateRoute,
});

function CreateRoute() {
  return <RecipeForm />;
}
