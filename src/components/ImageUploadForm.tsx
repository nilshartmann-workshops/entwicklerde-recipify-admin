import { type ChangeEvent, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

export default function ImageUploadForm() {
  const [imageTitle, setImageTitle] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1); // 0...3, 0.01
  const [croppedArea, setCroppedArea] = useState<Area>();

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  return (
    <form className={"ImageUploadForm"}>
      <section>
        <h2>Upload Image</h2>
        <div className={"FormControl"}>
          <label>Title</label>
          <input
            type={"text"}
            value={imageTitle}
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
          <div className={"Form Control ImageCropperField"}>
            <label>Cropped Image</label>
            <div className={"CropContainer"}>
              <Cropper
                crop={crop}
                onCropChange={setCrop}
                image={imageSrc}
                aspect={1.9}
                objectFit={"horizontal-cover"}
                zoom={zoom}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCroppedArea(croppedAreaPixels)
                }
                onWheelRequest={() => false}
              />
            </div>
            <div className="FormRow">
              <input
                type={"range"}
                value={zoom}
                max={3}
                step={0.01}
                onChange={(event) => setZoom(parseFloat(event.target.value))}
              />
              <button
                type={"button"}
                className={"secondary"}
                onClick={() => {
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </section>
    </form>
  );
}
