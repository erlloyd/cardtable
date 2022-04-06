import { Component } from "react";
import * as React from "react";
import { IEncounterEntity } from "./features/cards-data/cards-data.selectors";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@mui/material/TextField";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { GameType } from "./constants/app-constants";
interface IProps {
  currentGameType: GameType;
  encounterData: IEncounterEntity[];
  loadCards: (cards: string[][]) => void;
}

class EncounterLoader extends Component<IProps> {
  render() {
    return (
      <div onClick={this.cancelBubble} onKeyPress={this.cancelBubble}>
        <Autocomplete
          id="encounter-loader-combobox"
          groupBy={(option) => option.setData.setTypeCode}
          options={this.props.encounterData || []}
          getOptionLabel={(option) => option.setData.name}
          style={{ width: 300 }}
          onChange={this.handleSelected}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                GamePropertiesMap[this.props.currentGameType].encounterUiName
              }
              variant="outlined"
            />
          )}
        />
      </div>
    );
  }

  private handleSelected = (_event: any, value: IEncounterEntity | null) => {
    if (!!value) {
      let campaignCards: string[] = [];
      let questCards: string[] = [];
      let encounterCards: string[] = [];
      const filteredCards = value.cards
        // We don't want cards that show up as another card's 'back_link' to be loaded as separate cards
        .filter((c) => !value.cards.some((oc) => oc.backLink === c.code));

      filteredCards
        .filter((c) => c.typeCode.toLocaleLowerCase() === "quest")
        .forEach((c) => {
          questCards = questCards.concat(
            Array.from({ length: c.quantity }).map((_i) => c.code)
          );
        });

      // Right now these are set manually in the separate JSON repo and only for some card sets
      filteredCards
        .filter((c) => c.extraInfo.campaign === true)
        .forEach((c) => {
          campaignCards = campaignCards.concat(
            Array.from({ length: c.quantity }).map((_i) => c.code)
          );
        });

      filteredCards
        .filter(
          (c) =>
            c.typeCode.toLocaleLowerCase() !== "quest" && !c.extraInfo.campaign
        )
        .forEach((c) => {
          encounterCards = encounterCards.concat(
            Array.from({ length: c.quantity }).map((_i) => c.code)
          );
        });
      let totalCards = [encounterCards];
      if (questCards.length > 0) {
        totalCards = [questCards].concat(totalCards);
      }

      if (campaignCards.length > 0) {
        totalCards = totalCards.concat([campaignCards]);
      }

      this.props.loadCards(totalCards);
    }
  };

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };
}

export default EncounterLoader;
