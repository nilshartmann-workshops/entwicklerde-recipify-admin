import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: true, // true ist der Default
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        retry: 0,
      },
    },
  });
};
