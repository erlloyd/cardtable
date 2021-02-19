import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useState } from "react";
import { GameType } from "./constants/app-constants";
import GameContainer from "./GameContainer";

const App = () => {
  // Declare a new state variable, which we'll call "count"
  const [gameType, setGameType] = useState<GameType | null>(
    GameType.MarvelChampions
  );

  return !!gameType ? <GameContainer></GameContainer> : renderGamePicker();
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

const renderGamePicker = () => {
  return (
    <div>
      <Autocomplete
        id="game-picker"
        options={Object.entries(GameType).map(([key, value]) => {
          return { key, value };
        })}
        getOptionLabel={(option) => camelCaseToSpaces(option.key)}
        style={{ width: 300 }}
        onChange={(_e, value) => console.log(value?.value)}
        renderInput={(params) => (
          <TextField {...params} label="Choose Game" variant="outlined" />
        )}
      />
    </div>
  );
};

export default App;
