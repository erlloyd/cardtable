import { Autocomplete, TextField } from "@mui/material";
import { Vector2d } from "konva/lib/types";
import { CardData } from "./external-api/common-card-data";
import TopLayer from "./TopLayer";
import { v4 as uuidv4 } from "uuid";

interface IProps {
  position: Vector2d | null;
  heroData: CardData[];
  hideSpecificCardLoader: () => void;
  cardSelected: (jsonId: string) => void;
  preview: (jsonId: string) => void;
  clearPreview: () => void;
}

const SpecificCardLoader = (props: IProps) => {
  return !!props.position ? (
    <TopLayer
      trasparentBackground={false}
      offsetContent={false}
      position={props.position}
      completed={() => {
        props.hideSpecificCardLoader();
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
          options={props.heroData}
          getOptionLabel={(cd) => cd.name}
          style={{ width: 300 }}
          onChange={handleSelected(props)}
          onHighlightChange={handleHighlightChange(props)}
          renderOption={(props, option) => (
            <li {...props} key={uuidv4()}>
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={"Find Specific Card"}
              variant="outlined"
            />
          )}
        />
      </div>
    </TopLayer>
  ) : null;
};

const handleHighlightChange =
  (props: IProps) => (_event: any, option: CardData | null) => {
    if (!option) {
      props.clearPreview();
    } else {
      props.preview(option.code);
    }
  };

const handleSelected =
  (props: IProps) => (_event: any, value: CardData | null) => {
    props.clearPreview();
    if (!!value && !!props.cardSelected) {
      props.cardSelected(value.code);
      props.hideSpecificCardLoader();
    }
  };

export default SpecificCardLoader;
