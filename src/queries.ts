import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import _baseKy from "ky";

import {
  GetFeedbackDashboardListQueryResponse,
  GetImageByIdQueryResponse,
  GetMeQueryResponse,
  GetRecipeDashboardListQueryResponse,
  GetRecipeQueryResponse,
  LoginResponse,
  type NewApprovalStatus,
  SetFeedbackApprovalStatusMutationResponse,
} from "./_generated";

const ky = _baseKy.extend({
  retry: 0,
});

export const getRecipeDashboardListOpts = (page?: number) =>
  queryOptions({
    queryKey: ["admin", "recipes", "lists", "dashboard", { page }],
    async queryFn() {
      const searchParam = page === undefined ? "" : `?page=${page}`;

      const response = await ky
        .get("/api/admin/recipe-dashboard-list" + searchParam)
        .json();
      return GetRecipeDashboardListQueryResponse.parse(response);
    },
  });

export const getFeedbackDashboardQueryOpts = () =>
  queryOptions({
    queryKey: ["admin", "feedback", "lists", "dashboard"],
    async queryFn() {
      const response = await ky
        .get("/api/admin/feedback-dashboard-list")
        .json();
      return GetFeedbackDashboardListQueryResponse.parse(response);
    },
  });

export const getRecipeQueryOpts = (recipeId: string) =>
  queryOptions({
    queryKey: ["admin", "recipes", "details", recipeId],
    async queryFn() {
      const response = await ky.get("/api/admin/recipes/" + recipeId).json();
      return GetRecipeQueryResponse.parse(response);
    },
  });

export const getImageOpts = (imageId: string) =>
  queryOptions({
    queryKey: ["admin", "images", "details", "imageId"],
    async queryFn() {
      const response = await ky.get("/api/admin/images/" + imageId).json();
      return GetImageByIdQueryResponse.parse(response);
    },
  });

type SetFeedbackApprovalStatusMutationArgs = {
  feedbackId: string;
  newApprovalStatus: NewApprovalStatus;
};

export function useSetFeedbackApprovalStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(args: SetFeedbackApprovalStatusMutationArgs) {
      const response = await ky
        .patch(`/api/admin/feedback/${args.feedbackId}/approval-status`, {
          json: { newApprovalStatus: args.newApprovalStatus },
        })
        .json();

      return SetFeedbackApprovalStatusMutationResponse.parse(response);
    },
    onError(err) {
      console.error("mutation failed", err);
    },
    onSuccess(mutationResponse, args) {
      queryClient.setQueryData(
        getFeedbackDashboardQueryOpts().queryKey,
        (existingFeedbackList) => {
          if (!existingFeedbackList) {
            return;
          }

          return {
            ...existingFeedbackList,
            content: existingFeedbackList.content.map((f) =>
              f.id === args.feedbackId
                ? { ...f, approvalStatus: mutationResponse.approvalStatus }
                : f,
            ),
          };
        },
      );
    },
  });
}

export const meQueryOpts = () =>
  queryOptions({
    queryKey: ["admin", "me"],
    async queryFn() {
      try {
        const response = await ky.get("/api/admin/me").json();
        return GetMeQueryResponse.parse(response);
      } catch (err) {
        console.warn("Me-Query failed", err);
        return null;
      }
    },
  });

type MutationArgs = {
  username: string;
  password: string;
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    async mutationFn(args: MutationArgs) {
      const response = await ky.post("/api/login", { json: args }).json();
      return LoginResponse.parse(response);
    },
    onError(err) {
      console.log("Login failed", err);
      // ...
    },
    async onSettled() {
      queryClient.clear();
      await router.invalidate({ sync: true });
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      await ky.post("/api/logout").json();
    },
    async onSettled() {
      queryClient.clear();
      await router.invalidate({ sync: true });
    },
  }).mutate;
};
