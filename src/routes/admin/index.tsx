import { createFileRoute, Link } from "@tanstack/react-router";

import FeedbackDashboard from "../../components/FeedbackDashboard.tsx";
import RecipesDashboard from "../../components/RecipesDashboard.tsx";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className={"Dashboard"}>
      <Link className={"Action"} to={"/admin/create"}>
        Add Recipe
      </Link>
      <RecipesDashboard />
      <FeedbackDashboard />
    </div>
  );
}
