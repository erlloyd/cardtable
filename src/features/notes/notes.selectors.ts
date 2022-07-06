import { createSelector } from "reselect";
import { RootState } from "../../store/rootReducer";

export const getNotes = (state: RootState) => state.liveState.present.notes;

export const isNoteVisible = createSelector(
  getNotes,
  (notesState) => notesState.noteVisible
);

export const getNoteValue = createSelector(
  getNotes,
  (notesState) => notesState.note
);
