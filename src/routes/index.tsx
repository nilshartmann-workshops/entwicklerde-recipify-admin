import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className={"LandingPage"}>
      <h1>Recipify</h1>
      <h2>Administration tool</h2>
      <Link to={"/admin"}>Start</Link>
    </div>
  );
}
