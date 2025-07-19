import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod/v4";

import LoginForm from "../components/LoginForm.tsx";

const LoginSearchParams = z.object({
  redirect: z.string().optional().catch(""),
});

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: zodValidator(LoginSearchParams),
});

function RouteComponent() {
  const redirect = Route.useSearch().redirect;
  return (
    <div className={"LoginRoute"}>
      <LoginForm redirect={redirect} />
    </div>
  );
}
