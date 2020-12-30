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
      <div onClick={this.cancelBubble}>
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
      this.props.loadCards(value.cards.map((c) => c.code));
    }
  };

  private cancelBubble = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  };
}

export default EncounterLoader;
