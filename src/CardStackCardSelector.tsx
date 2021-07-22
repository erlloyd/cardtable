import { Component } from "react";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import * as React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { CardData } from "./external-api/common-card-data";
import { ICardData } from "./features/cards-data/initialState";
import { ICardStack } from "./features/cards/initialState";
import { AutocompleteHighlightChangeReason } from "@material-ui/lab/useAutocomplete";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import "./CardStackCardSelector.scss";
import InputLabel from "@material-ui/core/InputLabel";

interface IProps {
  cardsDataEntities: ICardData;
  card: ICardStack;
  cardSelected: (jsonId: string) => void;
  preview: (jsonId: string) => void;
  clearPreview: () => void;
  touchBased: boolean;
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
        {this.props.touchBased
          ? this.renderTouchList()
          : this.renderAutocomplete()}
      </div>
    );
  }

  private renderTouchList = () => {
    return (
      <div className="card-picker-select">
        <FormControl className="select">
          <InputLabel id="game-picker-label">Select Card...</InputLabel>
          <Select
            id="touch-cardstack-list"
            onChange={(e) => {
              if (!!e.target.value) {
                const val: string = (e.target.value as string) || "";
                this.handleSelected(e, this.props.cardsDataEntities[val]);
              }
            }}
            variant="outlined"
          >
            {this.cardsDataInStack.map((cd, index) => {
              return (
                <MenuItem
                  key={`select-item-card-${cd.code}-${index}`}
                  value={cd.code}
                >
                  <div className="card-picker-row">
                    <div>{cd.name}</div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.props.preview(cd.code);
                      }}
                      className="mobile-only"
                    >
                      <InfoOutlinedIcon />
                    </div>
                  </div>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    );
  };

  private renderAutocomplete = () => {
    return (
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
      />
    );
  };

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
