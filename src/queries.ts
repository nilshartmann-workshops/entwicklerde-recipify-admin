import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import _base_ky from "ky";
import {
  GetAllImagesQueryResponse,
  GetRecipeDashboardListQueryResponse,
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
    async queryFn() {
      const response = await ky
        .get("api/admin/recipe-dashboard-list?page=" + page)
        .json();
      return GetRecipeDashboardListQueryResponse.parse(response);
    },
  });
