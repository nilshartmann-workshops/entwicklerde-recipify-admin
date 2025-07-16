import { useState } from "react";

import type { ImageDto } from "../_generated";
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
