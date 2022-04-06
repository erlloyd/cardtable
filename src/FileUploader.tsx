import MenuItem from "@mui/material/MenuItem";
import React from "react";

interface IProps {
  label: string;
  key?: string;
  handleFile: (file: File) => void;
}

const FileUploader = (props: IProps) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event: React.MouseEvent) => {
    if (!!hiddenFileInput?.current) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      hiddenFileInput.current.dispatchEvent(evt);
    }
    event.stopPropagation();
  };
  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!!event.target.files && event.target.files.length > 0) {
      const fileUploaded = event.target.files[0];
      props.handleFile(fileUploaded);
    }
  };
  return (
    <>
      <MenuItem onClick={handleClick}>{props.label}</MenuItem>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export default FileUploader;
