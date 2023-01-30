import { TextField } from "@mui/material";
import {
  Autocomplete,
  // AutocompleteHighlightChangeReason,
} from "@material-ui/lab";
import { Vector2d } from "konva/lib/types";
import TopLayer from "./TopLayer";

interface IProps {
  position: Vector2d | null;
  hideDeckSearch: () => void;
}

const DeckSearch = (props: IProps) => {
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
          options={[]}
          // getOptionLabel={(cd) => cd.name}
          style={{ width: 300 }}
          // onChange={handleSelected(props)}
          // onHighlightChange={handleHighlightChange(props)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={"Search Online Decks"}
              variant="outlined"
            />
          )}
        />
      </div>
    </TopLayer>
  ) : null;
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
