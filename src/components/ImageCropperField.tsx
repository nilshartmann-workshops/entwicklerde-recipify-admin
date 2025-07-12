import React, { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not found");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Blob not created"));
    }, "image/png");
  });
}

type ImageCropperFieldProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  aspect?: number;
};

export function ImageCropperField({
  value,
  onChange,
  aspect = 1.9,
}: ImageCropperFieldProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "cropped.png", {
        type: "image/png",
      });

      onChange(croppedFile);
      setImageSrc(null);
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    onChange(null);
  };

  return (
    <div className={"ImageCropperField"}>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {imageSrc && (
        <div>
          <div className={"CropContainer"}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              objectFit={"horizontal-cover"}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <input
            type={"range"}
            min={0}
            max={3}
            step={"0.01"}
            value={zoom}
            onChange={(e) => {
              setZoom(parseFloat(e.target.value));
            }}
          />
          <div className={"Buttons"}>
            <button type="button" onClick={handleCrop} className={"primary"}>
              <i className="fa-regular fa-circle-check"></i>
              Apply
            </button>
            <button type="button" onClick={handleClear} className={"secondary"}>
              <i className="fa-regular fa-circle-xmark"></i>
              Cancel
            </button>
          </div>
        </div>
      )}
      {previewUrl && (
        <div className={"Preview"}>
          <img src={previewUrl} alt="Preview" />
          <div className={"Buttons"}>
            <button type="button" onClick={handleClear} className={"secondary"}>
              <i className="fa-regular fa-circle-xmark"></i>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
