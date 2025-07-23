import "./index.css";

import { createRoot } from "react-dom/client";

import App from "./components/App.tsx";
import { createQueryClient } from "./create-query-client.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient, recipifyRouter } from "./create-router.tsx";
import { RouterProvider } from "@tanstack/react-router";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={recipifyRouter} />
    <ReactQueryDevtools />
  </QueryClientProvider>,
);
