import React, { useState } from "react";
import { GameType } from "./constants/app-constants";
import GameContainer from "./GameContainer";

const App = () => {
  // Declare a new state variable, which we'll call "count"
  const [gameType, setGameType] = useState<GameType | null>(null);

  return <GameContainer></GameContainer>
};

export default App;
