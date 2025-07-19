import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { queryClient, recipifyRouter } from "./create-router.tsx";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={recipifyRouter} />
    <ReactQueryDevtools />
  </QueryClientProvider>,
);
