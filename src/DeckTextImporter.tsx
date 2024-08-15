import TopLayer from "./TopLayer";
import { GameType } from "./game-modules/GameType";
import "./DeckTextImporter.scss";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useCallback, useState } from "react";
import { Vector2d } from "konva/lib/types";
import GameManager from "./game-modules/GameModuleManager";
import { INotification } from "./features/notifications/initialState";
import { v4 } from "uuid";
import { CardSizeType, cardConstants } from "./constants/card-constants";

interface IProps {
  gameType: GameType | null;
  hideDeckTextImporter: () => void;
  positionToImport: Vector2d | null;
  sendNotification: (payload: INotification) => void;
  fetchDecklistByText: (payload: {
    gameType: GameType;
    position: Vector2d;
    text: string;
    fallbackResponse?: { data: any };
  }) => void;
}

const DeckTextImporter = (props: IProps) => {
  const [currentTextValue, setCurrentTextValue] = useState("");

  const handleDeckImport = useCallback(() => {
    props.fetchDecklistByText({
      gameType: props.gameType ?? GameType.MarvelChampions,
      position: props.positionToImport || { x: 100, y: 100 },
      text: currentTextValue,
    });
    setCurrentTextValue("");
    props.hideDeckTextImporter();
  }, [
    currentTextValue,
    props.hideDeckTextImporter,
    props.positionToImport,
    props.sendNotification,
  ]);

  return props.positionToImport !== null ? (
    <TopLayer
      staticPosition={true}
      trasparentBackground={true}
      offsetContent={false}
      position={{ x: 0, y: 0 }}
      completed={() => {
        setCurrentTextValue("");
        props.hideDeckTextImporter();
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
        className="deck-text-importer-wrapper"
      >
        <div className="deck-text-importer-background">
          <TextField
            id="deck-text-import-textarea"
            label="Import Deck"
            placeholder="Paste deck code"
            multiline
            maxRows={8}
            minRows={6}
            value={currentTextValue}
            style={{ width: "100%", paddingBottom: "10px" }}
            onChange={(e) => {
              setCurrentTextValue(e.target.value);
            }}
          />
          <div className="button-group">
            <Button variant="outlined" onClick={props.hideDeckTextImporter}>
              Cancel
            </Button>
            <Button
              disabled={currentTextValue === ""}
              variant="contained"
              onClick={handleDeckImport}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </TopLayer>
  ) : null;
};

export default DeckTextImporter;
