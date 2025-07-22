import { useSuspenseQuery } from "@tanstack/react-query";

import {
  getFeedbackDashboardQueryOpts,
  useSetFeedbackApprovalStatusMutation,
} from "../queries.ts";
import { formatDateTime } from "./date-utils.ts";

export default function FeedbackDashboard() {
  // Schritt 1: Ausgangsbasis, nur Code zeigen und erklären
  //  - nicht Schritt-für-Schritt machen

  const { data: feedbackList } = useSuspenseQuery({
    ...getFeedbackDashboardQueryOpts(),
    refetchInterval: 10_000,
  });

  const mutation = useSetFeedbackApprovalStatusMutation();

  return (
    <div className={"FeedbackDashboard"}>
      <h2>Feedback Approval</h2>
      <table>
        <thead>
          <tr>
            <th>Recipe</th>
            <th>Feedback-Id</th>
            <th>Updated</th>
            <th>Comment</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbackList.content.map((f) => (
            <tr key={f.id}>
              <td>
                {f.recipeTitle} (Id: {f.recipeId})
              </td>
              <td>{f.id}</td>
              <td>{formatDateTime(f.updatedAt)}</td>
              <td>{f.comment}</td>
              <td>{f.rating}</td>
              <td>{f.approvalStatus}</td>
              <td className={"Actions"}>
                <button
                  className={"reject"}
                  disabled={
                    f.approvalStatus === "REJECTED" || mutation.isPending
                  }
                  onClick={() =>
                    mutation.mutate({
                      recipeId: f.recipeId,
                      feedbackId: f.id,
                      newApprovalStatus: "REJECTED",
                    })
                  }
                >
                  ❌ Reject
                </button>
                <button
                  className={"approve"}
                  disabled={
                    f.approvalStatus === "APPROVED" || mutation.isPending
                  }
                  onClick={() =>
                    mutation.mutate({
                      recipeId: f.recipeId,
                      feedbackId: f.id,
                      newApprovalStatus: "APPROVED",
                    })
                  }
                >
                  ✅ Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
