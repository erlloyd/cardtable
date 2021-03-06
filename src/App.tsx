import React from "react";
import { GameType } from "./constants/app-constants";
import GameContainer from "./GameContainer";
import "./App.scss";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
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
      <FormControl className="select">
        <InputLabel id="game-picker-label">Select Game</InputLabel>
        <Select
          id="game-picker"
          labelId="game-picker-label"
          onChange={(e) => {
            props.updateActiveGameType(e.target.value as GameType);
          }}
        >
          {Object.entries(GameType).map(([key, value]) => {
            const label = camelCaseToSpaces(key);
            return <MenuItem value={value}>{label}</MenuItem>;
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default App;
