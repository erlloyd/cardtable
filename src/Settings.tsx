import { FormControlLabel, FormGroup, Slider } from "@mui/material";
import { ISettings } from "./features/game/initialState";
import TopLayer from "./TopLayer";
import "./Settings.scss";
import { useState } from "react";

interface IProps {
  visible: boolean;
  settings: ISettings;
  hideSettingsUi: () => {};
  updateSettings: (s: ISettings) => {};
}

const Settings = (props: IProps) => {
  if (!props.visible) return null;

  const [slidingValue, setSlidingValue] = useState(
    props.settings.scrollMultiplier
  );

  return (
    <TopLayer
      trasparentBackground={true}
      blurBackground={true}
      fullHeight={true}
      fullWidth={true}
      noPadding={true}
      position={{ x: 0, y: 0 }}
      completed={props.hideSettingsUi}
    >
      <div className="settings-wrapper">
        <div className="settings-panel">
          <h1>Settings</h1>
          <div>Zoom Sensitivity ({props.settings.scrollMultiplier})</div>
          <Slider
            key="sensitivity-slider"
            aria-label="Sensitivity"
            value={slidingValue}
            valueLabelDisplay="auto"
            step={0.2}
            marks
            min={0.2}
            max={6.0}
            onClick={stopProp}
            onChange={(_, value) => {
              if (Array.isArray(value)) {
                console.error("slider returned multiple values");
                return;
              }
              setSlidingValue(value);
            }}
            onChangeCommitted={(_, value) => {
              if (Array.isArray(value)) {
                console.error("slider returned multiple values");
                return;
              }
              props.updateSettings({
                ...props.settings,
                scrollMultiplier: value,
              });
            }}
          />
        </div>
      </div>
    </TopLayer>
  );
};

const stopProp = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export default Settings;
