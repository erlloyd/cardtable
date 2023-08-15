import TopLayer from "./TopLayer";
import { GameType } from "./game-modules/GameType";
import "./DeckTextImporter.scss";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useCallback, useState } from "react";
import { Vector2d } from "konva/lib/types";
import GameManager from "./game-modules/GameModuleManager";

interface IProps {
  gameType: GameType | null;
  hideDeckTextImporter: () => void;
  positionToImport: Vector2d | null;
  addCardStack: (payload: {
    cardJsonIds: string[];
    position: Vector2d;
  }) => void;
}

const DeckTextImporter = (props: IProps) => {
  const [currentTextValue, setCurrentTextValue] = useState("");

  const handleDeckImport = useCallback(() => {
    if (
      props.gameType &&
      !!GameManager.getModuleForType(props.gameType).loadDeckFromText
    ) {
      const cardStack = GameManager.getModuleForType(props.gameType)
        .loadDeckFromText!(currentTextValue);

      if (cardStack.length > 0) {
        props.addCardStack({
          cardJsonIds: cardStack,
          position: props.positionToImport || { x: 100, y: 100 },
        });
      }
    }
    setCurrentTextValue("");
    props.hideDeckTextImporter();
  }, [
    currentTextValue,
    props.hideDeckTextImporter,
    props.addCardStack,
    props.positionToImport,
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
            placeholder="Paste either Deck JSON or deck code"
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
