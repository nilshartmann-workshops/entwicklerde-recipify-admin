import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className={"LandingPage"}>
      <h1>Reipify</h1>
      <h2>Administration tool</h2>
      <Link to={"/admin"}>Admin Dashboard</Link>
    </div>
  );
}
