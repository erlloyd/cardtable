import { TextField } from "@mui/material";
import {
  Autocomplete,
  // AutocompleteHighlightChangeReason,
} from "@material-ui/lab";
import { Vector2d } from "konva/lib/types";
import TopLayer from "./TopLayer";
import { GameType } from "./game-modules/GameModule";
import debounce from "lodash/debounce";
import {
  OnlineDeckDataWithId,
  OnlineDeckDataMap,
} from "./features/game/initialState";
import { useState } from "react";

interface IProps {
  gameType: GameType | null;
  position: Vector2d | null;
  searching: boolean;
  mostRecentResults: OnlineDeckDataMap;
  hideDeckSearch: () => void;
  getListOfDecklistsFromSearchTerm: (payload: {
    decklistSearchTerm: string;
    position: Vector2d;
  }) => void;
  loadDeckId: (id: number, usePrivateApi: boolean) => void;
}

const focusInputField = (input: any) => {
  if (input) {
    setTimeout(() => {
      input.querySelector("input").focus();
    }, 100);
  }
};

const handleValueChangedDebounced = debounce(
  (v, props: IProps, setInternalSearching: (v: boolean) => void) => {
    setInternalSearching(false);
    props.getListOfDecklistsFromSearchTerm({
      decklistSearchTerm: v.target.value,
      position: { x: 0, y: 0 },
    });
  },
  500
);

const DeckSearch = (props: IProps) => {
  const [internalSearching, setInternalSearching] = useState(false);

  const handleValueChanged = (v: any) => {
    setInternalSearching(true);
    handleValueChangedDebounced(v, props, setInternalSearching);
  };

  return !!props.position ? (
    <TopLayer
      trasparentBackground={false}
      offsetContent={false}
      position={props.position}
      completed={() => {
        props.hideDeckSearch();
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <Autocomplete
          id="specific-card-loader-combobox"
          options={getOptions(props, internalSearching)}
          filterOptions={(options) => options}
          getOptionLabel={(deckInfo) => deckInfo.Name}
          style={{ width: 300 }}
          onChange={(_, value) => {
            if (!!value) {
              props.loadDeckId(value.Id, false);
            }
            props.hideDeckSearch();
          }}
          // onHighlightChange={handleHighlightChange(props)}
          renderInput={(params) => (
            <TextField
              {...params}
              ref={focusInputField}
              label={"Search Online Decks"}
              variant="outlined"
              onChange={handleValueChanged}
            />
          )}
        />
      </div>
    </TopLayer>
  ) : null;
};

const getOptions = (
  props: IProps,
  internalSearching: boolean
): OnlineDeckDataWithId[] => {
  if (props.searching || internalSearching) {
    return [
      { Likes: 0, Name: "Getting Decklists...", By: "", Hero: "", Id: -1 },
    ];
  }

  return Object.entries(props.mostRecentResults)
    .map((val) => {
      return { ...val[1], Id: +val[0] };
    })
    .sort((a, b) => b.Likes - a.Likes);
};

// const handleHighlightChange =
//   (props: IProps) =>
//   (
//     _event: any,
//     option: CardData | null,
//     reason: AutocompleteHighlightChangeReason
//   ) => {
//     if (!option) {
//       props.clearPreview();
//     } else {
//       props.preview(option.code);
//     }
//   };

// const handleSelected =
//   (props: IProps) => (_event: any, value: CardData | null) => {
//     props.clearPreview();
//     if (!!value && !!props.cardSelected) {
//       props.cardSelected(value.code);
//       props.hideSpecificCardLoader();
//     }
//   };

export default DeckSearch;
