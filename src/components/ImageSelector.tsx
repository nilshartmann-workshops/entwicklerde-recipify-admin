import { useDeferredValue, useState } from "react";

import type { ImageDto } from "../_generated";

type ImageSelectorProps = {
  allImages: ImageDto[];

  selectedImage: ImageDto | undefined;
  onImageSelected(selectedImage: ImageDto | undefined): void;
};

export default function ImageSelector({
  allImages,
  selectedImage,
  onImageSelected,
}: ImageSelectorProps) {
  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter);

  const filteredList = allImages.filter((i) =>
    i.title.toLowerCase().includes(deferredFilter.toLowerCase()),
  );

  const handleImageClick = (image: ImageDto) => {
    if (selectedImage?.id === image.id) {
      onImageSelected(undefined);
    } else {
      onImageSelected(image);
    }
  };

  return (
    <div className={"ImageSelector"}>
      <h2>Select image</h2>
      <div className={"FormRow"}>
        <label>Filter</label>
        <input
          type={"text"}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filteredList.map((img) => (
        <button key={img.id} onClick={() => handleImageClick(img)}>
          <ImagePreview
            src={img.src}
            title={img.title}
            selected={selectedImage?.id === img.id}
          />
        </button>
      ))}
    </div>
  );
}

type ImagePreviewProps = {
  title: string;
  src: string;

  selected?: boolean;
};

function ImagePreview({ title, src, selected }: ImagePreviewProps) {
  const className = selected ? "ImagePreview selected" : "ImagePreview";

  return (
    <div className={className}>
      {selected ? <i className={"fa-regular fa-circle-check"} /> : <div />}
      <div>{title}</div>
      <img src={src} alt={title} />
    </div>
  );
}
