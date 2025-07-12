import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ky from "ky";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod/v4";

import { fileToBase64 } from "../components/file-utils.ts";
import { ImageCropperField } from "../components/ImageCropperField.tsx";
import {
  CategoryDto,
  type CreateRecipeMutationRequest,
  CreateRecipeMutationResponse,
  MealTypeDto,
} from "../kubb-gen";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const RecipeFormSchema = z.object({
  mealTypeId: z.string().nonempty(),
  title: z.string().nonempty(),
  image: z
    .instanceof(File)
    .refine((f) => f.size > 0, "Bitte ein Bild zuschneiden und übernehmen"),

  headline: z.string().nonempty(),
  preparationTime: z.coerce.number().min(0),
  cookTime: z.coerce.number().min(0),
  categoryIds: z.string().array().min(1),
  instructions: z
    .object({
      value: z.string().nonempty(),
    })
    .array(),
  ingredients: z
    .object({
      // 125
      amount: z.preprocess((val) => {
        if (val === "") {
          return undefined;
        }
        return Number(val);
      }, z.number().min(0)),
      // gramm
      unit: z.string().nonempty(),
      // Zucker
      name: z.string().nonempty(),
    })
    .array(),
});

type RecipeFormState = z.infer<typeof RecipeFormSchema>;

function RouteComponent() {
  // const { data: categories } = useSuspenseQuery({
  //   queryKey: ["admin", "categories"],
  //   async queryFn() {
  //     const response = await ky
  //       .get("http://localhost:8080/api/admin/categories")
  //       .json();
  //     return CategoryDto.array().parse(response);
  //   },
  // });
  //
  // const { data: mealtypes } = useSuspenseQuery({
  //   queryKey: ["admin", "mealtypes"],
  //   async queryFn() {
  //     const response = await ky
  //       .get("http://localhost:8080/api/admin/meal-types")
  //       .json();
  //     return MealTypeDto.array().parse(response);
  //   },
  // });

  const [{ data: mealtypes }, { data: categories }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["admin", "mealtypes"],
        async queryFn() {
          const response = await ky.get("/api/admin/meal-types").json();
          return MealTypeDto.array().parse(response);
        },
      },
      {
        queryKey: ["admin", "categories"],
        async queryFn() {
          const response = await ky.get("/api/admin/categories").json();
          return CategoryDto.array().parse(response);
        },
      },
    ],
  });

  const mutation = useMutation({
    async mutationFn(data: CreateRecipeMutationRequest) {
      const response = await ky
        .post("/api/admin/recipe", {
          json: data,
        })
        .json();
      return CreateRecipeMutationResponse.parse(response);
    },
  });

  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
      categoryIds: [],
      ingredients: [
        {
          amount: 0,
          unit: "",
          name: "",
        },
      ],
      instructions: [{ value: "" }],
    },
  });

  const ingredients = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const instructions = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  const onInstructionsDragEnd = (result: DropResult) => {
    if (result.reason === "DROP" && result.destination) {
      instructions.move(result.source.index, result.destination.index);
    }
  };

  const handleSubmit = async (data: RecipeFormState) => {
    console.log("SAVE - data", data);

    const fileBase64 = await fileToBase64(data.image);

    mutation.mutate({
      ...data,
      image: fileBase64,
      instructions: data.instructions.map((i) => i.value),
    });
  };

  const handleSubmitError = (err: any) => {
    console.log("ERROR - err", err);
  };

  return (
    <form
      className={"RecipeForm"}
      onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
    >
      <section>
        <h2>Recipe</h2>
        <div className={"flex flex-row gap-x-8"}>
          <section className={"w-1/2"}>
            <div className={"FormRow"}>
              <label>Meal Type</label>
              <select {...form.register("mealTypeId")}>
                <option key={""}></option>
                {mealtypes.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="FormRow">
              <label>Title</label>
              <input {...form.register("title")} />
            </div>
            <div className="FormRow">
              <label>Headline</label>
              <input {...form.register("headline")} />
            </div>
            <div className="FormRow">
              <label>Categories</label>
              <Controller
                control={form.control}
                name={"categoryIds"}
                render={(field) => (
                  <CategorySelector
                    categories={categories}
                    selectedCategoryIds={field.field.value}
                    onSelectedCategoryIdsChange={field.field.onChange}
                  />
                )}
              />
            </div>
            <div className={"flex w-full space-x-8"}>
              <div className={"FormRow w-1/2"}>
                <label>Cooking time (Minutes)</label>
                <input type={"number"} {...form.register("cookTime")} />
              </div>
              <div className={"FormRow w-1/2"}>
                <label>Preparation time (Minutes)</label>
                <input type={"number"} {...form.register("preparationTime")} />
              </div>
            </div>
          </section>
          <section className={"w-1/2"}>
            <div className={"FormRow"}>
              <label>Image</label>
              <Controller
                control={form.control}
                name="image"
                render={({ field }) => (
                  <ImageCropperField
                    value={field.value}
                    onChange={field.onChange}
                    label="Bild auswählen & zuschneiden"
                  />
                )}
              />
            </div>
          </section>
        </div>
      </section>
      <section className={"Ingredients"}>
        <h2>Ingredients</h2>
        <header>
          <label>Amount</label>
          <label>Unit</label>
          <label>Name</label>
        </header>
        <ul>
          {ingredients.fields.map((field, index) => {
            return (
              <li key={field.id}>
                <input
                  type={"number"}
                  {...form.register(`ingredients.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                />
                <input {...form.register(`ingredients.${index}.unit`)} />
                <input {...form.register(`ingredients.${index}.name`)} />
                <div className="Buttons">
                  <button
                    type={"button"}
                    className={"primary"}
                    onClick={() => {
                      ingredients.insert(index + 1, {
                        amount: "",
                        unit: "",
                        name: "",
                      });
                    }}
                  >
                    <i className={"fa fa-circle-plus"} />
                    <span>Add</span>
                  </button>
                  <button
                    type={"button"}
                    className={"secondary"}
                    onClick={() => ingredients.remove(index)}
                  >
                    <i className="fa-regular fa-circle-xmark"></i>
                    <span>Remove</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={"Instructions"}>
        <h2>Instructions</h2>
        <DragDropContext onDragEnd={onInstructionsDragEnd}>
          <Droppable droppableId="instructions">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps}>
                {instructions.fields.map((field, index) => {
                  return (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={
                            snapshot.isDragging ? "dragging" : undefined
                          }
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move px-2 text-xl"
                          >
                            ☰
                          </div>
                          <div className={"Step"}>Step {index + 1}</div>
                          <input
                            {...form.register(`instructions.${index}.value`)}
                          />
                          <button
                            type={"button"}
                            className={"secondary"}
                            onClick={() => instructions.remove(index)}
                          >
                            <i className="fa-regular fa-circle-xmark"></i>
                            <span>Remove</span>
                          </button>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
          <button
            type={"button"}
            className={"primary"}
            onClick={() => {
              instructions.append({
                value: "",
              });
            }}
          >
            <i className={"fa fa-circle-plus"} />
            <span>Add</span>
          </button>
        </DragDropContext>
      </section>
      <div className={"ButtonBar"}>
        <button>Save</button>
      </div>
      <div className={"Feedback"}>
        {mutation.isSuccess && (
          <p className={"success"}>The recipe has been saved!</p>
        )}
        {mutation.isError && (
          <p className={"error"}>
            No no noThe recipe has been saved! {JSON.stringify(mutation.error)}
          </p>
        )}
      </div>
    </form>
  );
}
type CategorySelectorProps = {
  categories: CategoryDto[];
  selectedCategoryIds: string[];
  onSelectedCategoryIdsChange(newCategoryIds: string[]): void;
};

function CategorySelector({
  categories,
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
}: CategorySelectorProps) {
  const [orderBy, setOrderBy] = useState<"type" | "title">("title");

  const handleClick = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onSelectedCategoryIdsChange(
        selectedCategoryIds.filter((cId) => cId !== categoryId),
      );
    } else {
      onSelectedCategoryIdsChange([...selectedCategoryIds, categoryId]);
    }
  };

  const orderedCategories = [...categories].sort((c1, c2) => {
    return c1[orderBy].localeCompare(c2[orderBy]);
  });

  return (
    <div className={"CategorySelector"}>
      <div className={"OrderBar"}>
        <div>Order by</div>
        <button
          type={"button"}
          className={orderBy === "title" ? "selected" : undefined}
          onClick={() => setOrderBy("title")}
        >
          Title
        </button>
        <button
          type={"button"}
          className={orderBy === "type" ? "selected" : undefined}
          onClick={() => setOrderBy("type")}
        >
          Type
        </button>
      </div>
      {orderedCategories.map((c) => {
        return (
          <div
            className={
              selectedCategoryIds.includes(c.id)
                ? "CategoryItem selected"
                : "CategoryItem"
            }
            key={c.id}
            onClick={() => handleClick(c.id)}
          >
            <i className={c.icon} />
            <span>{c.title}</span>
          </div>
        );
      })}
    </div>
  );
}
