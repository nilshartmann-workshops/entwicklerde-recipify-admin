import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import ImageSelector from "../components/ImageSelector.tsx";
import RecipeForm from "../components/ReceipeForm.tsx";
import { demoImages } from "../data.ts";
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
      <RecipeForm />
      <ImageSelector
        allImages={demoImages}
        selectedImage={selectedImageId}
        onImageSelected={(imageId) => setSelectedImageId(imageId)}
      />
    </div>
  );
}
