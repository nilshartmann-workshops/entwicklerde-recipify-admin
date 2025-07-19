import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { useLoginMutation } from "../queries.ts";

const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type LoginForm = z.infer<typeof LoginFormSchema>;

type LoginFormProps = {
  redirect?: string;
};

export default function LoginForm({ redirect = "/admin" }: LoginFormProps) {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
  });

  const mutation = useLoginMutation();

  const handleLogin = async (data: LoginForm) => {
    console.log("DATA", data);
    await mutation.mutateAsync(data);
    navigate({ to: redirect });
  };

  return (
    <form className="LoginForm" onSubmit={form.handleSubmit(handleLogin)}>
      <section>
        <h2>Recipify Admin Login</h2>
        <div className={"FormControl"}>
          <label>Username</label>
          <input {...form.register("username")} />
        </div>
        <div className={"FormControl"}>
          <label>Password</label>
          <input type={"password"} {...form.register("password")} />
        </div>
      </section>
      <footer>
        <div className={"ButtonBar"}>
          <button className={"primary"} type={"submit"}>
            Login
          </button>
        </div>
        <div className={"Feedback"}>
          {mutation.isError && <p className={"error"}>Login failed.</p>}
        </div>
      </footer>
    </form>
  );
}
