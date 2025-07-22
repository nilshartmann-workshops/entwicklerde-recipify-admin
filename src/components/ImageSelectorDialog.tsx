import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";

import { getDemoImages } from "../demo-data.ts";
import ImageUploadForm from "./ImageUploadForm.tsx";
import ImageSelector from "./ImageSelector.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getImageListQueryOpts } from "../queries.ts";
import type { ImageDto } from "../_generated";

type ImageSelectorDialogProps = {
  // Kontrollierte Komponente!
  open: boolean;
  onClose(): void;

  selectedImage: ImageDto | undefined;
  onImageSelected(selectedImage: ImageDto | undefined): void;
};
export default function ImageSelectorDialog({
  open,
  onClose,

  selectedImage,
  onImageSelected,
}: ImageSelectorDialogProps) {
  const { data: allImages } = useSuspenseQuery(getImageListQueryOpts());
  const [tab, setTab] = useState<"select" | "upload">("select");

  return (
    <Dialog open={open} onClose={onClose} className="Dialog">
      <DialogBackdrop className="DialogBackdrop">
        <div className={"DialogInner"}>
          <DialogPanel className="DialogPanel">
            <DialogTitle className="DialogTitle">
              <div>Choose your image</div>
              <div className={"Tabs"}>
                <button onClick={() => setTab("select")}>Select</button>
                <button onClick={() => setTab("upload")}>Upload</button>
              </div>
            </DialogTitle>
            <div className={"DialogContent"}>
              {tab === "upload" && <ImageUploadForm />}
              {tab === "select" && (
                <ImageSelector
                  allImages={allImages}
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
