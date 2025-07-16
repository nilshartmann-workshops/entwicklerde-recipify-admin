import ky from "ky";
import React, { type ChangeEvent, type FormEvent, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { getCroppedImg } from "./get-cropped-image.ts";

export default function UploadImageForm() {
  const [imageTitle, setImageTitle] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedArea, setCroppedArea] = useState<Area>();
  const [zoom, setZoom] = useState(1);
  const [formState, setFormState] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageSrc(null);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => setImageSrc(fileReader.result as string);
    fileReader.readAsDataURL(file);
  };

  const handleReset = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormState(null);
    if (!imageSrc || !croppedArea) {
      setFormState({ type: "error", msg: "Please select an image" });
      return;
    }

    const fileToUpload = await getCroppedImg(imageSrc, croppedArea);

    const formData = new FormData();
    formData.set("title", imageTitle);
    formData.set("file", fileToUpload);

    try {
      const response = await ky
        .post<any>("/api/admin/images", {
          body: formData,
        })
        .json();

      setFormState({
        type: "success",
        msg: "Image saved: " + response.src,
      });
    } catch (err) {
      console.error("Upload failed", err);
      setFormState({
        type: "error",
        msg: "Upload failed " + err,
      });
    }
  };

  return (
    <form className={"UploadImageForm"} onSubmit={handleSubmit}>
      <section>
        <h2>Upload Image</h2>
        <div className={"FormControl"}>
          <label>Title</label>
          <input
            type={"text"}
            onChange={(e) => setImageTitle(e.target.value)}
          />
          {imageTitle.trim().length === 0 && (
            <div className={"error"}>Please enter an image title</div>
          )}
        </div>
        <div className={"FormControl"}>
          <label>Image</label>
          <input type="file" accept="image/*" onChange={handleSelectFile} />
        </div>
        {imageSrc !== null && (
          <div className={"FormControl ImageCropperField"}>
            <label>Cropped image</label>
            <div className={"CropContainer"}>
              <Cropper
                image={imageSrc}
                aspect={1.9}
                objectFit={"horizontal-cover"}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => {
                  setCroppedArea(pixels);
                }}
              />
            </div>
            <input
              type={"range"}
              max={3}
              step={0.01}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
            <div className={"Buttons"}>
              <button
                type={"button"}
                onClick={handleReset}
                className={"secondary"}
              >
                <i className="fa-regular fa-circle-xmark"></i>
                Reset
              </button>
            </div>
          </div>
        )}
      </section>
      <div className={"ButtonBar"}>
        <button type={"submit"} className={"primary"}>
          Upload
        </button>
      </div>
      <div className={"Feedback"}>
        {formState !== null && (
          <p className={formState.type}>{formState.msg}</p>
        )}
      </div>
    </form>
  );
}
