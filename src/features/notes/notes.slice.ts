import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { INotesState, initialState } from "./initialState";

// Reducers
const updateNoteValueReducer: CaseReducer<
  INotesState,
  PayloadAction<string>
> = (state, action) => {
  state.note = action.payload;
};

const toggleNotesReducer: CaseReducer<INotesState> = (state) => {
  state.noteVisible = !state.noteVisible;
};

// slice
const notesSlice = createSlice({
  name: "notes",
  initialState: initialState,
  reducers: {
    updateNoteValue: updateNoteValueReducer,
    toggleNotes: toggleNotesReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.note = action.payload.liveState.present.notes.note;
      state.noteVisible = action.payload.liveState.present.notes.noteVisible;
    });

    builder.addCase(resetApp, (state, action) => {
      state.note = "";
      state.noteVisible = false;
    });
  },
});

export const { updateNoteValue, toggleNotes } = notesSlice.actions;

export default notesSlice.reducer;
