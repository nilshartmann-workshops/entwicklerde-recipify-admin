import ImagePreview from "./ImagePreview.tsx";
import ImageSelector from "./ImageSelector.tsx";
import { getDemoImages } from "../demo-data.ts";
import { useState } from "react";
import type { ImageDto } from "../types.ts";
import ImageUploadForm from "./ImageUploadForm.tsx";
import ImageSelectorDialog from "./ImageSelectorDialog.tsx";

export default function App() {
  const allImages = getDemoImages();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedImage, setSelectImage] = useState<ImageDto | undefined>(
    allImages[1],
  );

  return (
    <div className={"App"}>
      <ImageSelectorDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedImage={selectedImage}
        onImageSelected={setSelectImage}
      />

      <button onClick={() => setIsDialogOpen(true)}>
        Open Image Selector Dialog
      </button>

      <ImageUploadForm />
      <p>Bild ausgewählt: {selectedImage?.title}</p>
      <ImageSelector
        allImages={allImages}
        selectedImage={selectedImage}
        onImageSelected={setSelectImage}
      />

      {/*<ImagePreview*/}
      {/*  title="Penne all'Arrabiata"*/}
      {/*  src="/assets/demo/penne.png"*/}
      {/*  checked={true}*/}
      {/*/>*/}
      {/*<ImagePreview*/}
      {/*  title="Spaghetti Napoli"*/}
      {/*  src="/assets/demo/napoli.png"*/}
      {/*  checked={false}*/}
      {/*/>*/}
    </div>
  );
}
