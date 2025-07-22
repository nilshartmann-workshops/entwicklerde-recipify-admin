// Properties props

// <ImagePreview title="Penne all'Arrabiata" src="/assets/demo/penne.png" checked={true} >

/*
const props = {
    title: "Penne all'Arrabiata",
    src: "/assets/demo/penne.png",
    checked: true,
}

 */

import { memo } from "react";

type ImagePreviewProps = {
  title: string;
  src: string;
  checked?: boolean;
};

const ImagePreview = memo(function ImagePreview({
  title,
  src,
  checked = false,
}: ImagePreviewProps) {
  // Model
  // View
  // Controller
  // MVC Pattern

  // const divClassName = props.checked ? "ImagePreview checked" : "ImagePreview"

  // const icon = props.checked ? <i className={"fa-regular fa-circle-check"} />: <div />;
  // const iconZurLaufzeit = props.checked ? createElement("i") : createElement("div");

  // Co-Location

  // JSX
  return (
    <div className={checked ? "ImagePreview checked" : "ImagePreview"}>
      {checked ? <i className={"fa-regular fa-circle-check"} /> : <div />}
      <div>{title}</div>
      <img src={src} alt={title} />
    </div>
  );
});

export default ImagePreview;
