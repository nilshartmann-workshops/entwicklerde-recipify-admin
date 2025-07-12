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
  instructions: z.string().nonempty().array(),
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
    },
  });

  const ingredients = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  return (
    <form
      className={"RecipeForm"}
      onSubmit={form.handleSubmit(
        (d) => console.log("DATA", d),
        (e) => console.log("ERROR", e),
      )}
    >
      {/*{ingredients.fields.map((field, index) => {*/}
      {/*  return (*/}
      {/*    <div key={field.id}>*/}
      {/*      <label>Name</label>*/}
      {/*      <input {...form.register(`ingredients.${index}.name`)} />*/}

      {/*      <label>Amount</label>*/}
      {/*      <input*/}
      {/*        type={"number"}*/}
      {/*        {...form.register(`ingredients.${index}.amount`, {*/}
      {/*          valueAsNumber: true,*/}
      {/*        })}*/}
      {/*      />*/}

      {/*      <label>Unit</label>*/}
      {/*      <input {...form.register(`ingredients.${index}.unit`)} />*/}
      {/*      <button type={"button"} onClick={() => ingredients.remove(index)}>*/}
      {/*        Löschen*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  );*/}
      {/*})}*/}
      {/*<button*/}
      {/*  type={"button"}*/}
      {/*  onClick={() =>*/}
      {/*    ingredients.append({*/}
      {/*      amount: undefined,*/}
      {/*      name: "",*/}
      {/*      unit: "",*/}
      {/*    })*/}
      {/*  }*/}
      {/*>*/}
      {/*  Add*/}
      {/*</button>*/}

      <div className={"FormRow"}>
        <label>Meal Type</label>
        <select
          className={
            "font-space text-red mb-1 w-full border-0 border-b border-b-gray-200 text-sm font-medium tracking-[2px] uppercase"
          }
        >
          <option key={""}></option>
          {mealtypes.map((mt) => (
            <option key={mt.id} value={mt.id}>
              {mt.name}
            </option>
          ))}
        </select>
      </div>
      <div className="FormRow">
        <label>Titel</label>
        <input className={"font-space text-5xl font-bold"} />
      </div>
      <div className="FormRow">
        <label>Headline</label>
        <input />
      </div>

      <div className="FormRow">
        <label>Categories</label>
        <CategorySelector categories={categories} />
      </div>

      <div className={"FormRow TimeSelector"}>
        <label>Time</label>
        <div>
          <div>
            <label>Cooking</label>
            <div className={"Input"}>
              <input type={"number"} />
              <div>minutes</div>
            </div>
          </div>
          <div>
            <label>Preparation</label>
            <div className={"Input"}>
              <input type={"number"} />
              <div>minutes</div>
            </div>
          </div>
        </div>
      </div>

      <div className={"FormRow"}>
        <label></label>
        <div
          className={"flex w-5/6 flex-col items-start justify-start gap-y-4"}
        >
          <div className={"font-space text-3xl font-bold"}>Ingredients</div>
          <div className={"grid w-full grid-cols-3"}>
            <label>Name</label>
            <label>Amount</label>
            <label>Unit</label>
          </div>
          {ingredients.fields.map((field, index) => {
            return (
              <div key={field.id} className={"mt-6 grid w-full grid-cols-3"}>
                <div>
                  <input {...form.register(`ingredients.${index}.name`)} />
                </div>
                <div>
                  <input
                    type={"number"}
                    {...form.register(`ingredients.${index}.amount`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div>
                  <input {...form.register(`ingredients.${index}.unit`)} />
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => {
            ingredients.append({
              name: "",
              amount: "",
              unit: "",
            });
          }}
        >
          Add
        </button>
      </div>

      {/*<div*/}
      {/*  className={*/}
      {/*    "FormControl font-space text-red text-sm font-medium tracking-[2px] uppercase"*/}
      {/*  }*/}
      {/*>*/}
      {/*  <select*/}
      {/*    className={*/}
      {/*      "font-space text-red text-sm font-medium tracking-[2px] uppercase"*/}
      {/*    }*/}
      {/*  >*/}
      {/*    <option key={""}>Select meal type</option>*/}
      {/*    {mealtypes.map((mt) => (*/}
      {/*      <option key={mt.id} value={mt.id}>*/}
      {/*        {mt.name}*/}
      {/*      </option>*/}
      {/*    ))}*/}
      {/*  </select>*/}
      {/*</div>*/}

      {/*<div className={"FormControl"}>*/}
      {/*  <label className={"font-space mt-4 mb-4 text-5xl font-bold"}>*/}
      {/*    Title*/}
      {/*  </label>*/}
      {/*  <input className={"font-space mt-4 mb-4 text-5xl font-bold"} />*/}
      {/*</div>*/}
      {/*<div className={"FormControl"}>*/}
      {/*  <label>Title</label>*/}
      {/*  <input />*/}
      {/*</div>*/}

      {/*<div className={"FormControl"}>*/}
      {/*  <label>headline</label>*/}
      {/*  <input />*/}
      {/*</div>*/}

      {/*<div className={"FormControl"}>*/}
      {/*  <label>Preparation time</label>*/}
      {/*  <input />*/}
      {/*</div>*/}

      {/*<div className={"FormControl"}>*/}
      {/*  <label>Cook time</label>*/}
      {/*  <input />*/}
      {/*</div>*/}

      {/*<div className={"FormControl"}>*/}
      {/*  <CategorySelector categories={categories} />*/}
      {/*</div>*/}
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
