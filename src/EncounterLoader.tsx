import { Component } from "react";
import * as React from "react";
import { IEncounterEntity } from "./features/cards-data/cards-data.selectors";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
interface IProps {
  encounterData: IEncounterEntity[];
}

class EncounterLoader extends Component<IProps> {
  render() {
    return (
      <div onClick={this.cancelBubble}>
        <Autocomplete
          id="combo-box-demo"
          options={this.props.encounterData || []}
          getOptionLabel={(option) => option.setData.name}
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Encounter Set" variant="outlined" />
          )}
        />
      </div>
    );
  }

  private cancelBubble = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  };
}

export default EncounterLoader;
