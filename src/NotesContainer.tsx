import { connect } from "react-redux";
import { getNoteValue, isNoteVisible } from "./features/notes/notes.selectors";
import { toggleNotes, updateNoteValue } from "./features/notes/notes.slice";
import Notes from "./Notes";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    visible: isNoteVisible(state),
    noteValue: getNoteValue(state),
  };
};

const NotesContainer = connect(mapStateToProps, {
  toggleNotes,
  updateNoteValue,
})(Notes);

export default NotesContainer;
