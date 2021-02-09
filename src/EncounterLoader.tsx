import { Component } from "react";
import * as React from "react";
import { IEncounterEntity } from "./features/cards-data/cards-data.selectors";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
interface IProps {
  encounterData: IEncounterEntity[];
  loadCards: (cards: string[]) => void;
}

class EncounterLoader extends Component<IProps> {
  render() {
    return (
      <div onClick={this.cancelBubble} onKeyPress={this.cancelBubble}>
        <Autocomplete
          id="encounter-loader-combobox"
          options={this.props.encounterData || []}
          getOptionLabel={(option) => option.setData.name}
          style={{ width: 300 }}
          onChange={this.handleSelected}
          renderInput={(params) => (
            <TextField {...params} label="Encounter Set" variant="outlined" />
          )}
        />
      </div>
    );
  }

  private handleSelected = (_event: any, value: IEncounterEntity | null) => {
    if (!!value) {
      let encounterCards: string[] = [];
      value.cards
        // We don't want cards that show up as another card's 'back_link' to be loaded as separate cards
        .filter((c) => !value.cards.some((oc) => oc.back_link === c.code))
        // Add the number of cards indicated by the quantity field
        .forEach((c) => {
          encounterCards = encounterCards.concat(
            Array.from({ length: c.quantity }).map((_i) => c.code)
          );
        });
      this.props.loadCards(encounterCards);
    }
  };

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };
}

export default EncounterLoader;
