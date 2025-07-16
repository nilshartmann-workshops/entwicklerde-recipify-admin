import "./index.css";

import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { recipifyRouter } from "./create-router.tsx";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={recipifyRouter} />,
);
