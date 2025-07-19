import { createFileRoute } from "@tanstack/react-router";

import RecipeForm from "../../components/ReceipeForm.tsx";

export const Route = createFileRoute("/admin/create")({
  component: RecipeForm,
});
