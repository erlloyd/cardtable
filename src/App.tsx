import { useEffect } from "react";
import { GameType } from "./constants/app-constants";
import GameContainer from "./GameContainer";
import "./App.scss";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import mainLogo from "./images/card-table-transparent.png";
interface IProps {
  activeGameType: GameType | null;
  updateActiveGameType: (val: GameType) => void;
  clearQueryParams: () => void;
}

const App = (props: IProps) => {
  const clearQueryParams = props.clearQueryParams;
  useEffect(() => {
    clearQueryParams();
  }, [clearQueryParams]);

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
      <img className="logo" alt="cardtable" src={mainLogo}></img>
      <FormControl className="select">
        <InputLabel id="game-picker-label">Select Game</InputLabel>
        <Select
          id="game-picker"
          labelId="game-picker-label"
          onChange={(e) => {
            props.updateActiveGameType(e.target.value as GameType);
          }}
          variant={"standard"}
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
