import type { ImageDto } from "../types.ts";
import ImagePreview from "./ImagePreview.tsx";
import { useDeferredValue, useId, useMemo, useState } from "react";

type ImageSelectorProps = {
  allImages: ImageDto[];

  selectedImage: ImageDto | undefined;
  onImageSelected(newSelectedImage: ImageDto | undefined): void;
};
export default function ImageSelector({
  allImages,
  selectedImage,
  onImageSelected,
}: ImageSelectorProps) {
  const [filter, setFilter] = useState("");

  const deferredFilter = useDeferredValue(filter);

  const filterInputId = useId();

  const filteredImages = useMemo(() => {
    console.log("Filter images", deferredFilter);
    return allImages.filter((i) =>
      i.title.toLowerCase().includes(deferredFilter.toLowerCase()),
    );
  }, [deferredFilter, allImages]);

  const handleImageClick = (newSelectedImage: ImageDto) => {
    if (selectedImage?.id === newSelectedImage.id) {
      onImageSelected(undefined);
      return;
    }
    onImageSelected(newSelectedImage);
  };

  return (
    <div className={"ImageSelector"}>
      <h2>Select image</h2>

      <div className={"FormRow"}>
        <label htmlFor={filterInputId}>Filter</label>
        <input
          id={filterInputId}
          type={"text"}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>

      {filteredImages.map((img) => {
        return (
          <button key={img.id} onClick={() => handleImageClick(img)}>
            <ImagePreview
              title={img.title}
              src={img.src}
              checked={selectedImage?.id === img.id}
            />
          </button>
        );
      })}
    </div>
  );
}
