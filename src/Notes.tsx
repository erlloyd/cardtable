import TextField from "@mui/material/TextField";
import TopLayer from "./TopLayer";
import debounce from "lodash/debounce";
import { useEffect, useRef, useState } from "react";

interface IProps {
  visible: boolean;
  noteValue: string;
  toggleNotes: () => void;
  updateNoteValue: (val: string) => void;
}

const Notes = (props: IProps) => {
  const [debouncedNoteValue, setNoteValue] = useState(props.noteValue);

  const handleTextChange = (e: any) => {
    setNoteValue(e.target.value);
    sendTextChange(e.target.value);
  };

  useEffect(() => {
    setNoteValue(props.noteValue);
  }, [props.noteValue]);

  const sendTextChange = useRef(
    debounce((newValue) => {
      props.updateNoteValue(newValue);
    }, 500)
  ).current;

  return props.visible ? (
    <TopLayer
      trasparentBackground={false}
      offsetContent={false}
      position={{
        x: Math.max(window.innerWidth / 2 - 100, 10),
        y: Math.max(window.innerHeight / 2 - 200, 10),
      }}
      completed={() => {
        props.toggleNotes();
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <TextField
          id="notes-textarea"
          label="Notes"
          placeholder="Enter any notes you want to remember here"
          multiline
          maxRows={8}
          minRows={4}
          value={debouncedNoteValue}
          onChange={handleTextChange}
        />
      </div>
    </TopLayer>
  ) : null;
};

export default Notes;
