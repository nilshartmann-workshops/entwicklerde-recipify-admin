import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import ky from "ky";
import { useState } from "react";

import { ImageDto } from "../_generated";
import ImageSelector from "./ImageSelector.tsx";
import UploadImageForm from "./UploadImageForm.tsx";

type ImageSelectorDialogProps = {
  // Kontrollierte Komponente!
  open: boolean;
  onClose?(): void;

  selectedImage: ImageDto | undefined;
  onImageSelected(newImage: ImageDto | undefined): void;
};
export default function ImageSelectorDialog({
  open,
  onClose,
  selectedImage,
  onImageSelected,
}: ImageSelectorDialogProps) {
  const [tab, setTab] = useState<"select" | "upload">("select");
  // Aufgaben:
  //  - Anzeige des Selectors in einem Dialog
  //  - Laden der Bilder
  //  - Idee: "Desktop-App"-like Dialog:
  //   - man kann ein Bild auswählen oder neu hochladen

  return (
    <Dialog open={open} onClose={() => onClose?.()} className="Dialog">
      <DialogBackdrop className="DialogBackdrop">
        <div className={"DialogInner"}>
          <DialogPanel className="DialogPanel">
            <DialogTitle className="DialogTitle">
              <div>Select image</div>
              <div className={"Tabs"}>
                <button onClick={() => setTab("select")}>Select</button>
                <button onClick={() => setTab("upload")}>Upload</button>
              </div>
            </DialogTitle>
            <div className={"DialogContent"}>
              {tab === "upload" && <UploadImageForm />}
              {tab === "select" && (
                <ImageSelectorDialogContent
                  onImageSelected={onImageSelected}
                  selectedImage={selectedImage}
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </DialogBackdrop>
    </Dialog>
  );
}

// DEMO: DATEN LADEN
type ImageSelectorDialogContentProps = {
  selectedImage: ImageDto | undefined;
  onImageSelected(newImage: ImageDto | undefined): void;
};
function ImageSelectorDialogContent({
  selectedImage,
  onImageSelected,
}: ImageSelectorDialogContentProps) {
  const { data: allImages } = useSuspenseQuery({
    queryKey: ["admin", "images"],
    async queryFn() {
      const response = await ky.get("/api/admin/images").json();
      return ImageDto.array().parse(response);
    },
  });

  return (
    <ImageSelector
      allImages={allImages}
      selectedImage={selectedImage}
      onImageSelected={onImageSelected}
    />
  );
}
