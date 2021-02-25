import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React from "react";
import { GameType } from "./constants/app-constants";
import GameContainer from "./GameContainer";
import "./App.scss";
interface IProps {
  activeGameType: GameType | null;
  updateActiveGameType: (val: GameType) => void;
}

const App = (props: IProps) => {
  return !!props.activeGameType ? (
    <GameContainer currentGameType={props.activeGameType}></GameContainer>
  ) : (
    renderGamePicker(props)
  );
};

const camelCaseToSpaces = (str: string) => {
  // insert a space before all caps
  return (
    str
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, (s) => {
        return s.toUpperCase();
      })
  );
};

const renderGamePicker = (props: IProps) => {
  return (
    <div className="game-picker">
      <h1>Card Game Playground</h1>
      <Autocomplete
        id="game-picker"
        options={Object.entries(GameType).map(([key, value]) => {
          return { key, value };
        })}
        getOptionLabel={(option) => camelCaseToSpaces(option.key)}
        style={{ width: 300 }}
        onChange={(_e, value) => {
          if (!!value) props.updateActiveGameType(value.value);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Choose Game" variant="outlined" />
        )}
      />
    </div>
  );
};

export default App;
