import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import ky from "ky";
import { type ReactNode, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod/v4";

import {
  AdminRecipeDto,
  CategoryDto,
  type CreateRecipeMutationRequest,
  ImageDto,
  MealTypeDto,
} from "../_generated";
import ImageSelectorDialog from "./ImageSelectorDialog.tsx";

const RecipeFormSchema = z.object({
  mealTypeId: z.string().nonempty(),
  title: z.string().nonempty(),
  image: ImageDto,
  headline: z.string().nonempty(),
  preparationTime: z.coerce.number().min(0),
  cookTime: z.coerce.number().min(0),
  categoryIds: z.string().array().min(1),
  instructions: z
    .object({
      description: z.string().nonempty(),
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
      }, z.number().positive()),
      // gramm
      unit: z.string().nonempty(),
      // Zucker
      name: z.string().nonempty(),
    })
    .array()
    .min(1),
});

type RecipeFormState = z.infer<typeof RecipeFormSchema>;

type RecipeFormProps = {
  existingRecipe?: AdminRecipeDto;
};

export default function RecipeForm({ existingRecipe }: RecipeFormProps) {
  console.log("existingR", existingRecipe);
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
      let response = null;

      if (existingRecipe) {
        // UPDATE
        response = await ky
          .put("/api/admin/recipes/" + existingRecipe.id, {
            json: data,
          })
          .json();
      } else {
        response = await ky
          .post("/api/admin/recipes", {
            json: data,
          })
          .json();
      }

      return AdminRecipeDto.parse(response);
    },
  });

  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: existingRecipe
      ? {
          ...existingRecipe,
        }
      : {
          categoryIds: [],
          ingredients: [
            {
              amount: 0,
              unit: "",
              name: "",
            },
          ],
          instructions: [{ description: "" }],
        },
  });

  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

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

    mutation.mutate({
      ...data,
      imageId: data.image.id,
    });
  };

  const handleSubmitError = (err: any) => {
    console.log("ERROR - err", err);
  };

  const image = form.watch("image");
  console.log("image", image);

  return (
    <form
      className={"RecipeForm"}
      onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
    >
      <section>
        <h2>Recipe</h2>
        <div className={"flex flex-row gap-x-8"}>
          <section>
            <div className={"FormControl"}>
              <label>Meal Type</label>
              <select {...form.register("mealTypeId")}>
                <option key={""}></option>
                {mealtypes.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt.name}
                  </option>
                ))}
              </select>
              <ErrorMessage>
                {form.formState.errors.mealTypeId?.message}
              </ErrorMessage>
            </div>
            <div className="FormControl">
              <label>Title</label>
              <input {...form.register("title")} />
              <ErrorMessage>
                {form.formState.errors.title?.message}
              </ErrorMessage>
            </div>
            <div className="FormControl">
              <label>Headline</label>
              <input {...form.register("headline")} />
              <ErrorMessage>
                {form.formState.errors.headline?.message}
              </ErrorMessage>
            </div>
            <div className={"FormControl"}>
              <label>Image</label>
              {image && <img src={image.src} />}
              <div className={"Buttons"}>
                <button
                  type={"button"}
                  className={"primary"}
                  onClick={() => setIsImageSelectorOpen(true)}
                >
                  Select image...
                </button>
                <ErrorMessage>
                  {form.formState.errors.image?.message}
                </ErrorMessage>
              </div>
              <Controller
                control={form.control}
                name={"image"}
                render={(field) => (
                  <ImageSelectorDialog
                    open={isImageSelectorOpen}
                    onClose={() => setIsImageSelectorOpen(false)}
                    selectedImage={field.field.value}
                    onImageSelected={(image) => {
                      field.field.onChange(image);
                      setIsImageSelectorOpen(false);
                    }}
                  />
                )}
              />
            </div>

            <div className="FormControl">
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
              <ErrorMessage>
                {form.formState.errors.categoryIds?.message}
              </ErrorMessage>
            </div>
            <div className={"flex w-full space-x-8"}>
              <div className={"FormControl w-1/2"}>
                <label>Cooking time (Minutes)</label>
                <input type={"number"} {...form.register("cookTime")} />
                <ErrorMessage>
                  {form.formState.errors.cookTime?.message}
                </ErrorMessage>
              </div>
              <div className={"FormControl w-1/2"}>
                <label>Preparation time (Minutes)</label>
                <input type={"number"} {...form.register("preparationTime")} />
                <ErrorMessage>
                  {form.formState.errors.preparationTime?.message}
                </ErrorMessage>
              </div>
            </div>
          </section>
          {/*<section className={"w-1/2"}>*/}
          {/*  <div className={"FormRow"}>*/}
          {/*    <label>Image</label>*/}
          {/*    <Controller*/}
          {/*      control={form.control}*/}
          {/*      name="image"*/}
          {/*      render={({ field }) => (*/}
          {/*        <ImageCropperField*/}
          {/*          value={field.value}*/}
          {/*          onChange={field.onChange}*/}
          {/*          label="Bild auswählen & zuschneiden"*/}
          {/*        />*/}
          {/*      )}*/}
          {/*    />*/}
          {/*    <ErrorMessage>*/}
          {/*      {form.formState.errors.image?.message}*/}
          {/*    </ErrorMessage>*/}
          {/*  </div>*/}
          {/*</section>*/}
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
                <div className={"FormControl"}>
                  <input {...form.register(`ingredients.${index}.amount`)} />
                  <ErrorMessage>
                    {
                      form.formState.errors.ingredients?.[index]?.amount
                        ?.message
                    }
                  </ErrorMessage>
                </div>
                <div className={"FormControl"}>
                  <input {...form.register(`ingredients.${index}.unit`)} />
                  <ErrorMessage>
                    {form.formState.errors.ingredients?.[index]?.unit?.message}
                  </ErrorMessage>
                </div>
                <div className={"FormControl"}>
                  <input {...form.register(`ingredients.${index}.name`)} />
                  <ErrorMessage>
                    {form.formState.errors.ingredients?.[index]?.name?.message}
                  </ErrorMessage>
                </div>
                <div className={"FormControl"}>
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
                      disabled={ingredients.fields.length === 1}
                      onClick={() => ingredients.remove(index)}
                    >
                      <i className="fa-regular fa-circle-xmark"></i>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <ErrorMessage>
          {form.formState.errors.ingredients?.root?.message}
        </ErrorMessage>
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
                          <div>
                            <div
                              className={"DragHandle"}
                              {...provided.dragHandleProps}
                            >
                              ☰
                            </div>
                            <div className={"Step"}>Step {index + 1}</div>
                            <input
                              {...form.register(
                                `instructions.${index}.description`,
                              )}
                            />
                            <div className={"Buttons"}>
                              <button
                                type={"button"}
                                className={"primary"}
                                onClick={() => {
                                  instructions.insert(index + 1, {
                                    description: "",
                                  });
                                }}
                              >
                                <i className={"fa fa-circle-plus"} />
                                <span>Add</span>
                              </button>
                              <button
                                type={"button"}
                                className={"secondary"}
                                disabled={instructions.fields.length === 1}
                                onClick={() => instructions.remove(index)}
                              >
                                <i className="fa-regular fa-circle-xmark"></i>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className={"col-start-3"}>
                              <ErrorMessage>
                                {
                                  form.formState.errors.instructions?.[index]
                                    ?.description?.message
                                }
                              </ErrorMessage>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </section>
      <div className={"ButtonBar"}>
        <button className={"primary"}>Save</button>
        <button
          type={"button"}
          className={"secondary"}
          onClick={() => form.reset()}
        >
          Reset
        </button>
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

type ErrorMessageProps = {
  children: ReactNode;
};

function ErrorMessage({ children }: ErrorMessageProps) {
  if (!children) {
    return;
  }

  return <div className={"error"}>{children}</div>;
}
