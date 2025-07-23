import { Suspense } from "react";

import FeedbackDashboard from "./FeedbackDashboard.tsx";
import RecipesDashboard from "./RecipesDashboard.tsx";

// Das brauchen wir später noch!
export default function Dashboard() {
  return (
    <div className={"Dashboard container mx-auto"}>
      <Suspense
        fallback={
          <h2 className={"Loading"}>
            Please wait, while dashboard is loading...
          </h2>
        }
      >
        <RecipesDashboard />
      </Suspense>
      <FeedbackDashboard />
    </div>
  );
}
