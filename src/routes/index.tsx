import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import ImageSelectorDialog from "../components/ImageSelectorDialog.tsx";
import { ImageDto } from "../kubb-gen";

export const Route = createFileRoute("/")({
  component: Demo,
});

function Demo() {
  const [selectedImageId, setSelectedImageId] = useState<ImageDto | undefined>(
    undefined,
  );

  return (
    <div>
      <ImageSelectorDialog
        open={true}
        selectedImage={selectedImageId}
        onImageSelected={(i) => setSelectedImageId(i)}
      />
      {/*<RecipeForm />*/}
      {/*<ImageSelector*/}
      {/*  allImages={demoImages}*/}
      {/*  selectedImage={selectedImageId}*/}
      {/*  onImageSelected={(imageId) => setSelectedImageId(imageId)}*/}
      {/*/>*/}
    </div>
  );
}
