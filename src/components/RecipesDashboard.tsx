import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";

import { getRecipeDashboardListOpts } from "../queries.ts";

const Route = getRouteApi("/admin/");

export default function RecipesDashboard() {
  const page = Route.useSearch({
    select: (s) => s.recipesDashboardPage,
  });

  const { data } = useSuspenseQuery(getRecipeDashboardListOpts(page));

  const { pageNumber, hasNext, hasPrevious } = data;

  return (
    <div className={"RecipesDashboard"}>
      <h2>Latest Recipes</h2>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Headline</th>
            <th className={"right"}>Likes</th>
            <th className={"right"}>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {data.content.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>
                <Link to={"/admin/$recipeId"} params={{ recipeId: r.id }}>
                  {r.title}
                </Link>
              </td>
              <td>{r.headline}</td>
              <td className={"right"}>{r.likes}</td>
              <td className={"right"}>{r.feedbackCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav>
        <Link
          to={"/admin"}
          disabled={!hasPrevious}
          search={{
            recipesDashboardPage: pageNumber - 1,
          }}
        >
          Previous
        </Link>
        <Link
          to={"/admin"}
          disabled={!hasNext}
          search={{
            recipesDashboardPage: pageNumber + 1,
          }}
        >
          Next
        </Link>
      </nav>
    </div>
  );
}
