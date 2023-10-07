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
  addCardStack: (payload: {
    cardJsonIds: string[];
    position: Vector2d;
  }) => void;
  sendNotification: (payload: INotification) => void;
}

const DeckTextImporter = (props: IProps) => {
  const [currentTextValue, setCurrentTextValue] = useState("");

  const handleDeckImport = useCallback(() => {
    if (
      props.gameType &&
      !!GameManager.getModuleForType(props.gameType).loadDeckFromText
    ) {
      try {
        const cardStacks = GameManager.getModuleForType(props.gameType)
          .loadDeckFromText!(currentTextValue);

        let startPosition = props.positionToImport || { x: 100, y: 100 };

        cardStacks.forEach((cardStack, index) => {
          if (cardStack.length > 0) {
            // TODO: Support other sizes other than standard cards
            props.addCardStack({
              cardJsonIds: cardStack,
              position: {
                x:
                  startPosition.x +
                  (cardConstants[CardSizeType.Standard].CARD_WIDTH + 10) *
                    index,
                y: startPosition.y,
              },
            });
          }
        });
      } catch (e) {
        // Something went wrong, show an error
        props.sendNotification({
          id: v4(),
          level: "error",
          message:
            "Could not load deck from the text provided. Check to make sure you copied the entire deck code",
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
