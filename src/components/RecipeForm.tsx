import { z } from "zod/v4";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCategoriesQueryOpts,
  getMealtypesQueryOpts,
  useSaveRecipeMutation,
} from "../queries.ts";
import { type ReactNode, useState } from "react";
import { ImageDto } from "../_generated";
import ImageSelectorDialog from "./ImageSelectorDialog.tsx";
import CategorySelector from "./CategorySelector.tsx";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

const Ingredient = z.object({
  amount: z.preprocess((val) => {
    // Leeres Zahlen Feld liefert Leerstring zurück
    if (val === "") {
      return undefined;
    }

    // wenn kein Leerstring, versuchen, Zahl draus zu machen
    // die wird dann im nächsten Schritt geprüft
    return Number(val);
  }, z.number().positive()),
  unit: z.string().nonempty(),
  name: z.string().nonempty(),
});

const RecipeFormSchema = z.object({
  mealTypeId: z.string().nonempty("Please select a mealtype"),
  title: z.string().nonempty("Please enter a title"),
  headline: z.string().nonempty("Please enter a headline"),
  preparationTime: z.coerce
    .number()
    .min(0, "Preparation time must be at least 0"),
  cookTime: z.coerce.number().min(0, "Cooking time must be at least 0"),
  image: z.object(ImageDto.shape, "Please select an image"),
  categoryIds: z.string().array().min(1),
  ingredients: Ingredient.array().min(1),
  instructions: z
    .object({
      description: z.string().nonempty(),
    })
    .array()
    .min(1),
});

type RecipeFormSchema = z.infer<typeof RecipeFormSchema>;

export default function RecipeForm() {
  const [{ data: mealTypes }, { data: categories }] = useSuspenseQueries({
    queries: [getMealtypesQueryOpts(), getCategoriesQueryOpts()],
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
      instructions: [{ description: "" }],
    },
  });

  const mutation = useSaveRecipeMutation();

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const image = form.watch("image");

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

  const handleRecipeSubmit = (data: RecipeFormSchema) => {
    console.log("SUBMIT WITH DATA", data);

    mutation.mutate({
      ...data,
      imageId: data.image.id,
    });
  };

  const handleSubmitError = (err: any) => {
    console.log("ERROR", err);
  };

  return (
    <form
      className={"RecipeForm"}
      onSubmit={form.handleSubmit(handleRecipeSubmit, handleSubmitError)}
    >
      <fieldset disabled={mutation.isPending}>
        <section>
          <h2>Recipe Data</h2>
          <div className={"FormControl"}>
            <label>Meal Type</label>
            <select {...form.register("mealTypeId")}>
              <option value={""}>Please select meal type</option>
              {mealTypes.map((mt) => (
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
            <ErrorMessage>{form.formState.errors.title?.message}</ErrorMessage>
          </div>
          <div className="FormControl">
            <label>Headline</label>
            <input {...form.register("headline")} />
            <ErrorMessage>
              {form.formState.errors.headline?.message}
            </ErrorMessage>
          </div>
          <div className={"FormRow"}>
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
          <div className={"FormControl"}>
            <label>Image</label>
            {image && <img src={image.src} alt={image.title} />}
            <div className={"Buttons"}>
              <button
                type={"button"}
                className={"primary"}
                onClick={() => setImageDialogOpen(true)}
              >
                Select Image
              </button>
              <Controller
                control={form.control}
                name={"image"}
                render={(field) => (
                  <ImageSelectorDialog
                    onClose={() => setImageDialogOpen(false)}
                    open={imageDialogOpen}
                    onImageSelected={(newImage) => {
                      field.field.onChange(newImage);
                      setImageDialogOpen(false);
                    }}
                    selectedImage={field.field.value}
                  />
                )}
              />
              <ErrorMessage>
                {form.formState.errors.image?.message}
              </ErrorMessage>
            </div>
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
          <section className={"Ingredients"}>
            <h2>Ingredients</h2>
            <header>
              <label>Amount</label>
              <label>Unit</label>
              <label>Name</label>
            </header>
            <ul>
              {ingredients.fields.map((field, ix) => {
                return (
                  <li key={field.id}>
                    <div className={"FormControl"}>
                      <input {...form.register(`ingredients.${ix}.amount`)} />
                      <ErrorMessage>
                        {
                          form.formState.errors.ingredients?.[ix]?.amount
                            ?.message
                        }
                      </ErrorMessage>
                    </div>

                    <div className={"FormControl"}>
                      <input {...form.register(`ingredients.${ix}.unit`)} />
                      <ErrorMessage>
                        {form.formState.errors.ingredients?.[ix]?.unit?.message}
                      </ErrorMessage>
                    </div>

                    <div className={"FormControl"}>
                      <input {...form.register(`ingredients.${ix}.name`)} />
                      <ErrorMessage>
                        {form.formState.errors.ingredients?.[ix]?.name?.message}
                      </ErrorMessage>
                    </div>

                    <div className={"FormControl"}>
                      <div className="Buttons">
                        <button
                          type={"button"}
                          className={"primary"}
                          onClick={() =>
                            ingredients.insert(ix + 1, {
                              amount: "",
                              unit: "",
                              name: "",
                            })
                          }
                        >
                          <i className={"fa fa-circle-plus"} />
                          <span>Add</span>
                        </button>
                        <button
                          type={"button"}
                          className={"secondary"}
                          onClick={() => ingredients.remove(ix)}
                          disabled={ingredients.fields.length === 1}
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
                                      form.formState.errors.instructions?.[
                                        index
                                      ]?.description?.message
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
        </section>
        <footer>
          <div className={"ButtonBar"}>
            <button>Save</button>
            <button
              type={"button"}
              className={"secondary"}
              onClick={() => form.reset()}
            >
              Reset
            </button>
          </div>
          <div className={"Feedback"}>
            {mutation.isPending && <p>Please stay tuned... recipe saving</p>}
            {mutation.isSuccess && (
              <p className={"success"}>Recipe has been saved.</p>
            )}
            {mutation.isError && (
              <p className={"error"}>
                Recipe could not be saved: {mutation.error.message}
              </p>
            )}
          </div>
        </footer>
      </fieldset>
    </form>
  );
}

type ErrorMessageProps = {
  children?: ReactNode;
};

// <ErrorMessage errorMessage="..." />
// <ErrorMessage>{errorMessage}</ErrorMessage>

function ErrorMessage({ children }: ErrorMessageProps) {
  if (!children) {
    return null;
  }

  return <div className={"error"}>{children}</div>;
}
