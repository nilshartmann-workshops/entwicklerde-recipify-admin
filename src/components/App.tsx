import ImagePreview from "./ImagePreview.tsx";
import ImageSelector from "./ImageSelector.tsx";
import { getDemoImages } from "../demo-data.ts";
import { useState } from "react";
import ImageUploadForm from "./ImageUploadForm.tsx";
import ImageSelectorDialog from "./ImageSelectorDialog.tsx";
import type { ImageDto } from "../_generated";
import RecipesDashboard from "./RecipesDashboard.tsx";

export default function App() {
  const allImages = getDemoImages();

  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  //
  // const [selectedImage, setSelectImage] = useState<ImageDto | undefined>(
  //   allImages[1],
  // );

  return (
    <div className={"Dashboard container mx-auto"}>
      <RecipesDashboard />
    </div>
  );
}
