import { useState } from "react";
import "./DevSettings.scss";
import { Button, Checkbox } from "@mui/material";
import {
  DEV_WS_LS_KEY,
  USE_WEBRTC_LS_KEY,
  SHOW_HIDDEN_GAMES_LS_KEY,
  useDevWSServerLocalStorage,
  useWebRTCLocalStorage,
  showHiddenGamesLocalStorage,
} from "./constants/app-constants";

interface IProps {
  onClose: () => void;
}

const DevSettings = (props: IProps) => {
  const [useWebRTCMP, setUseWebRTCMP] = useState(
    !!localStorage.getItem(USE_WEBRTC_LS_KEY)
  );
  const [useDevWS, setUseDevWS] = useState(
    !!localStorage.getItem(DEV_WS_LS_KEY)
  );
  const [showHidden, setShowHidden] = useState(
    !!localStorage.getItem(SHOW_HIDDEN_GAMES_LS_KEY)
  );

  const changesDetected =
    useWebRTCMP !== useWebRTCLocalStorage ||
    useDevWS !== useDevWSServerLocalStorage ||
    showHidden !== showHiddenGamesLocalStorage;

  const handleChange =
    (setter: (val: boolean) => void, lsKey: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        localStorage.setItem(lsKey, "true");
      } else {
        localStorage.removeItem(lsKey);
      }

      setter(event.target.checked);
    };

  return (
    <div className="dev-settings">
      <div>
        <span>Use WebRTC multiplayer: </span>{" "}
        <Checkbox
          onChange={handleChange(setUseWebRTCMP, USE_WEBRTC_LS_KEY)}
          checked={useWebRTCMP}
          style={{
            color: "white",
          }}
        ></Checkbox>
      </div>
      <div>
        <span>Use dev multiplayer server: </span>{" "}
        <Checkbox
          onChange={handleChange(setUseDevWS, DEV_WS_LS_KEY)}
          checked={useDevWS}
          style={{
            color: "white",
          }}
        ></Checkbox>
      </div>
      <div>
        <span>Show hidden games: </span>{" "}
        <Checkbox
          onChange={handleChange(setShowHidden, SHOW_HIDDEN_GAMES_LS_KEY)}
          checked={showHidden}
          style={{
            color: "white",
          }}
        ></Checkbox>
      </div>
      <Button
        onClick={() => {
          props.onClose();
        }}
      >
        Close
      </Button>
      {changesDetected && (
        <span className="refresh">
          Changes detected. Refresh browser to apply
        </span>
      )}
    </div>
  );
};

export default DevSettings;
