import { useState } from "react";

import type { CategoryDto } from "../_generated";

type CategorySelectorProps = {
  categories: CategoryDto[];
  selectedCategoryIds: string[];
  onSelectedCategoryIdsChange(newCategoryIds: string[]): void;
};

export default function CategorySelector({
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
