import { Component } from "react";
import * as React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { CardData } from "./external-api/common-card-data";
import { ICardData } from "./features/cards-data/initialState";
import { ICardStack } from "./features/cards/initialState";
import { AutocompleteHighlightChangeReason } from "@material-ui/lab/useAutocomplete";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import "./CardStackCardSelector.scss";

interface IProps {
  cardsDataEntities: ICardData;
  card: ICardStack;
  cardSelected: (jsonId: string) => void;
  preview: (jsonId: string) => void;
  clearPreview: () => void;
}

class CardStackCardSelector extends Component<IProps> {
  private cardsDataInStack: CardData[] = [];

  constructor(props: IProps) {
    super(props);
    this.cardsDataInStack = props.card.cardStack.map((c) => {
      return this.props.cardsDataEntities[c.jsonId];
    });
  }

  componentWillUnmount() {
    this.props.clearPreview();
  }

  render() {
    return (
      <div onClick={this.cancelBubble} onKeyPress={this.cancelBubble}>
        <Autocomplete
          id="cardstack-card-selector-combobox"
          options={this.cardsDataInStack}
          getOptionLabel={(option) => option.name || "Unknown Card Name"}
          style={{ width: 300 }}
          onChange={this.handleSelected}
          onHighlightChange={this.handleHighlightChange}
          renderInput={(params) => (
            <TextField {...params} label="Find Card..." variant="outlined" />
          )}
          renderOption={(option) => (
            <div className="card-picker-row">
              <div>{option.name}</div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.preview(option.code);
                }}
                className="mobile-only"
              >
                <InfoOutlinedIcon />
              </div>
            </div>
          )}
        />
      </div>
    );
  }

  private handleHighlightChange = (
    _event: any,
    option: CardData | null,
    reason: AutocompleteHighlightChangeReason
  ) => {
    if (!option) {
      this.props.clearPreview();
    } else {
      this.props.preview(option.code);
    }
  };

  private handleSelected = (_event: any, value: CardData | null) => {
    this.props.clearPreview();
    if (!!value && !!this.props.cardSelected) {
      this.props.cardSelected(value.code);
    }
  };

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };
}

export default CardStackCardSelector;
