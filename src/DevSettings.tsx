import { useState } from "react";
import "./DevSettings.scss";
import { Button, Checkbox } from "@mui/material";
import {
  DEV_WS_LS_KEY,
  USE_WS_LS_KEY,
  useDevWSServerLocalStorage,
  useWSLocalStorage,
} from "./constants/app-constants";

interface IProps {
  onClose: () => void;
}

const DevSettings = (props: IProps) => {
  const [useWSMP, setUseWSMP] = useState(!!localStorage.getItem("__ws_mp__"));
  const [useDevWS, setUseDevWS] = useState(
    !!localStorage.getItem("__dev_ws__")
  );

  const changesDetected =
    useWSMP !== useWSLocalStorage || useDevWS !== useDevWSServerLocalStorage;

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
        <span>Use webservice multiplayer: </span>{" "}
        <Checkbox
          onChange={handleChange(setUseWSMP, USE_WS_LS_KEY)}
          checked={useWSMP}
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
