import { useState } from "react";

import { ImageDto } from "../kubb-gen";
import UploadImageForm from "./UploadImageForm.tsx";

export default function App() {
  const [selectedImageId, setSelectedImageId] = useState<ImageDto | undefined>(
    undefined,
  );

  return (
    <div className={"App"}>
      <UploadImageForm />
    </div>
  );
}
