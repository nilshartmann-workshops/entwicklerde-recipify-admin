import { useSuspenseQuery } from "@tanstack/react-query";

import { formatDateTime } from "./date-utils.ts";
import { getRecipeDashboardListQueryOpts } from "../queries.ts";
import { useState } from "react";

export default function RecipesDashboard() {
  const [page, setPage] = useState(0);
  const { data } = useSuspenseQuery(getRecipeDashboardListQueryOpts(page));

  const { pageNumber, hasNext, hasPrevious } = data;

  return (
    <div className={"RecipesDashboard"}>
      <h2>Recipes Dashboard</h2>
      <section>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Last Changed</th>
              <th>Title</th>
              <th className={"right"}>Feedback (approved/open)</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{formatDateTime(r.updatedAt)}</td>
                <td>{r.title}</td>
                <td className={"right"}>
                  {r.approvedFeedbackCount} /{" "}
                  {r.pendingFeedbackCount + r.rejectedFeedbackCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <nav>
        <button
          type={"button"}
          disabled={!hasPrevious}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        Page: {page} / {pageNumber}
        <button
          type={"button"}
          disabled={!hasNext}
          onClick={() => setPage(page + 1)}
        >
          Previous
        </button>
      </nav>
    </div>
  );
}
