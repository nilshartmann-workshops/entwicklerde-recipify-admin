import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ky from "ky";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod/v4";

import { CategoryDto, MealTypeDto } from "../kubb-gen";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

/*

              id: z.string(),
              createdAt: z.string(),
              userFullname: z.string(), <-- eventuell später

  title: z.string(),
  headline: z.string(),
  preparationTime: z.number(),
  cookTime: z.number(),
  categories: z.array(CategoryDto),
  mealType: z.string(),
              averageRating: z.number(),
              likes: z.number(),
  instructions: z.array(Instruction),
  ingredients: z.array(Ingredient),

 */

const RecipeFormSchema = z.object({
  mealType: z.string().nonempty(),
  title: z.string().nonempty(),
  // headline: z.string().nonempty(),
  // preparationTime: z.number().min(0),
  // cookTime: z.number().min(0),
  // categories: z.string().array(),
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

function RouteComponent() {
  const { data: categories } = useSuspenseQuery({
    queryKey: ["admin", "categories"],
    async queryFn() {
      const response = await ky
        .get("http://localhost:8080/api/admin/categories")
        .json();
      return CategoryDto.array().parse(response);
    },
  });

  const { data: mealtypes } = useSuspenseQuery({
    queryKey: ["admin", "mealtypes"],
    async queryFn() {
      const response = await ky
        .get("http://localhost:8080/api/admin/meal-types")
        .json();
      return MealTypeDto.array().parse(response);
    },
  });

  console.log("CATEGORIES", categories);
  console.log("MEAL TYPES", mealtypes);

  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
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

  return (
    <form
      className={"RecipeForm"}
      onSubmit={form.handleSubmit(
        (d) => console.log("DATA", d),
        (e) => console.log("ERROR", e),
      )}
    >
      <section>
        <h2>Recipe</h2>
        <div className={"flex flex-row gap-x-8"}>
          <section className={"w-1/2"}>
            <div className={"FormRow"}>
              <label>Meal Type</label>
              <select>
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
              <input />
            </div>
            <div className="FormRow">
              <label>Headline</label>
              <input />
            </div>
            <div className="FormRow">
              <label>Categories</label>
              <CategorySelector categories={categories} />
            </div>
            <div className={"flex w-full space-x-8"}>
              <div className={"FormRow w-1/2"}>
                <label>Cooking time (Minutes)</label>
                <input type={"number"} />
              </div>
              <div className={"FormRow w-1/2"}>
                <label>Preparation time (Minutes)</label>
                <input type={"number"} />
              </div>
            </div>
          </section>
          <section className={"w-1/2"}>
            <div className={"FormRow"}>
              <label>Image</label>
              <img
                src={"/images/recipes/food_3.png"}
                className={"rounded ps-2"}
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
        <ul>
          {instructions.fields.map((field, index) => {
            return (
              <li key={field.id}>
                <div className={"Step"}>Step {index + 1}</div>
                <input {...form.register(`instructions.${index}.value`)} />
                <button
                  type={"button"}
                  className={"secondary"}
                  onClick={() => instructions.remove(index)}
                >
                  <i className="fa-regular fa-circle-xmark"></i>
                  <span>Remove</span>
                </button>
              </li>
            );
          })}
        </ul>
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
      </section>
      <div className={"ButtonBar"}>
        <button>Save</button>
        <button>Save</button>
      </div>
    </form>
  );
}

type CategorySelectorProps = {
  categories: CategoryDto[];
};

function CategorySelector({ categories }: CategorySelectorProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<"type" | "title">("title");

  const handleClick = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(
        selectedCategoryIds.filter((cId) => cId !== categoryId),
      );
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
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
