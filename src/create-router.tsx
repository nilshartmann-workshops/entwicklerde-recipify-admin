import { createRouter } from "@tanstack/react-router";

import { createQueryClient } from "./create-query-client.tsx";
import { routeTree } from "./routeTree.gen.ts";

export const queryClient = createQueryClient();

// Create a new router instance
export const recipifyRouter = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof recipifyRouter;
  }
}
