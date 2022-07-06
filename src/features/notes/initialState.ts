import { loadState } from "../../store/localStorage";
import JSONCrush from "jsoncrush";

export interface INotesState {
  note: string;
  noteVisible: boolean;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsNotesString = queryParams.get("notes");
const queryParamsNotes = !!queryParamsNotesString
  ? JSON.parse(JSONCrush.uncrush(queryParamsNotesString))
  : null;

const localStorageState: INotesState =
  queryParamsNotes || (loadState("liveState")?.notes ?? {});

localStorageState.noteVisible = false;

const defaultState: INotesState = {
  note: "",
  noteVisible: false,
};
export const initialState: INotesState = {
  ...defaultState,
  ...localStorageState,
};
