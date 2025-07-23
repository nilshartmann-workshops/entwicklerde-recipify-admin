import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  getRecipeDashboardListQueryOpts,
  getRecipeDetailsQueryOpts,
} from "../queries.ts";
import { formatDateTime } from "./date-utils.ts";
import { getRouteApi, Link } from "@tanstack/react-router";

const Route = getRouteApi("/admin/");

export default function RecipesDashboard() {
  // const [selectedRecipeId, setSelectedRecipeId] = useState<string>();

  const page = Route.useSearch({
    select: (params) => params.recipesDashboardPage || 0,
  });

  const selectedRecipeId = Route.useSearch({
    select: (params) => params.selectedRecipeId,
  });

  // const [page, setPage] = useState(0);

  const { data, isFetching } = useSuspenseQuery(
    getRecipeDashboardListQueryOpts(page),
  );

  return (
    <div
      className={isFetching ? "RecipesDashboard fetching" : "RecipesDashboard"}
    >
      <h2>Recipes Dashboard {isFetching && "updating"}</h2>
      <section>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Last Changed</th>
              <th>Title</th>
              <th className={"right"}>Feedback (approved/open)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{formatDateTime(r.updatedAt)}</td>
                <td>
                  <Link
                    to={"/admin/$recipeId"}
                    params={{
                      recipeId: r.id,
                    }}
                  >
                    {r.title}
                  </Link>
                </td>
                <td className={"right"}>
                  {r.approvedFeedbackCount} /{" "}
                  {r.pendingFeedbackCount + r.rejectedFeedbackCount}
                </td>
                <td className={"Actions"}>
                  <Link
                    to={"/admin"}
                    search={(current) => ({
                      ...current,
                      selectedRecipeId: r.id,
                    })}
                  >
                    🔎 Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedRecipeId !== undefined && (
          <RecipeDetails recipeId={selectedRecipeId} />
        )}
      </section>
      <nav>
        <Link
          to={"/admin"}
          search={{
            recipesDashboardPage: page - 1,
          }}
        >
          Previous
        </Link>
        Page: {page}
        <Link
          to={"/admin"}
          search={{
            recipesDashboardPage: page + 1,
          }}
        >
          Next
        </Link>
      </nav>
    </div>
  );
}

type RecipeDetailsProps = {
  recipeId: string;
};
function RecipeDetails({ recipeId }: RecipeDetailsProps) {
  const { data: recipe } = useSuspenseQuery(
    getRecipeDetailsQueryOpts(recipeId),
  );

  return (
    <div className={"RecipeDetails"}>
      <h2>{recipe.title}</h2>
      <p>Id: {recipe.id}</p>
      <p>Approved feedback: {recipe.approvedFeedbackCount}</p>
      <p>Rejected feedback: {recipe.rejectedFeedbackCount}</p>
      <p>Pending feedback: {recipe.pendingFeedbackCount}</p>
      <img src={recipe.image.src} alt={recipe.image.title} />
    </div>
  );
}
