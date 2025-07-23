import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import _base_ky from "ky";
import {
  AdminRecipeDto,
  type CreateRecipeMutationRequest,
  GetAdminRecipeQueryResponse,
  GetAllImagesQueryResponse,
  GetCategoriesQueryResponse,
  GetFeedbackDashboardListQueryResponse,
  GetMealTypesQueryResponse,
  GetRecipeDashboardListQueryResponse,
  type NewApprovalStatus,
  SetFeedbackApprovalStatusMutationResponse,
} from "./_generated";

const ky = _base_ky.extend({
  retry: 0,
});

export const getImageListQueryOpts = () =>
  queryOptions({
    queryKey: ["images", "list"],
    async queryFn() {
      const response = await ky.get("/api/admin/images").json();
      const images = GetAllImagesQueryResponse.parse(response);
      return images;
    },
  });

export const useSaveImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(formData: FormData) {
      const response = ky
        .post("api/admin/images", {
          body: formData,
        })
        .json();

      return response;
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: getImageListQueryOpts().queryKey,
      });
    },
  });
};

export const getRecipeDashboardListQueryOpts = (page = 0) =>
  queryOptions({
    queryKey: ["recipes", "lists", "dashboard", { page }],
    staleTime: 5_000,
    async queryFn() {
      const response = await ky
        .get("api/admin/recipe-dashboard-list?page=" + page + "&slowdown=0")
        .json();
      return GetRecipeDashboardListQueryResponse.parse(response);
    },
  });

export const getFeedbackDashboardQueryOpts = () =>
  queryOptions({
    queryKey: ["feedback", "lists", "dashboard"],
    async queryFn() {
      const response = await ky
        .get("/api/admin/feedback-dashboard-list")
        .json();
      return GetFeedbackDashboardListQueryResponse.parse(response);
    },
  });

type SetFeedbackApprovalStatusMutationArgs = {
  recipeId: string;
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
    onSuccess(data, vars) {
      queryClient.invalidateQueries({
        queryKey: ["recipes", "lists"],
      });

      queryClient.invalidateQueries({
        queryKey: getRecipeDetailsQueryOpts(vars.recipeId).queryKey,
      });

      queryClient.setQueryData(
        getFeedbackDashboardQueryOpts().queryKey,
        (existingFeedbackList) => {
          if (!existingFeedbackList) {
            return existingFeedbackList;
          }

          return {
            ...existingFeedbackList,
            content: existingFeedbackList.content.map((feedback) =>
              feedback.id === vars.feedbackId
                ? { ...feedback, approvalStatus: data.approvalStatus }
                : feedback,
            ),
          };
        },
      );
    },
  });
}

export const getRecipeDetailsQueryOpts = (recipeId: string) =>
  queryOptions({
    queryKey: ["recipes", "details", recipeId],
    async queryFn() {
      const response = await ky.get("/api/admin/recipes/" + recipeId).json();
      return GetAdminRecipeQueryResponse.parse(response);
    },
  });

export const getMealtypesQueryOpts = () =>
  queryOptions({
    queryKey: ["admin", "mealtypes"],
    async queryFn() {
      const response = await ky.get("/api/admin/meal-types").json();
      return GetMealTypesQueryResponse.parse(response);
    },
    staleTime: 10_000,
  });

export const getCategoriesQueryOpts = () =>
  queryOptions({
    queryKey: ["admin", "categories"],
    // lange Staletime, weil Daten sich nicht ändern
    staleTime: 10_000,
    async queryFn() {
      // lange Staletime, weil Daten sich nicht ändern
      const response = await ky.get("/api/admin/categories").json();
      return GetCategoriesQueryResponse.parse(response);
    },
  });

export const useSaveRecipeMutation = (recipeId?: string) => {
  const mutation = useMutation({
    async mutationFn(recipe: CreateRecipeMutationRequest) {
      let response;

      if (recipeId === undefined) {
        response = await ky
          .post("/api/admin/recipes", {
            json: recipe,
          })
          .json();
      } else {
        response = await ky
          .put("/api/admin/recipes/" + recipeId, {
            json: recipe,
          })
          .json();
      }
      return AdminRecipeDto.parse(response);
    },
  });
  return mutation;
};
