import CloseIcon from "@material-ui/icons/Close";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { H } from "highlight.run";
import log from "loglevel";
import mixpanel from "mixpanel-browser";
import React, { useEffect, useRef, useState } from "react";
import { useKonami } from "react-konami-code";
import "./App.scss";
import DevSettings from "./DevSettings";
import GameContainer from "./GameContainer";
import { GameType } from "./game-modules/GameType";
import mainLogo from "./images/card-table-transparent.png";
import { cacheCommonImages } from "./utilities/game-utils";
import GameManager from "./game-modules/GameModuleManager";
import { ConfirmProvider } from "material-ui-confirm";
import { INotification } from "./features/notifications/initialState";
import { v4 } from "uuid";
import NotificationsContainer from "./Notifications/NotificationsContainer";
import { showCustomGamesLocalStorage } from "./constants/app-constants";

const legacy = false;

const darkTheme = createTheme({
  palette: {
    mode: "light",
  },
});

(window as any).log = log;

interface IProps {
  activeGameType: GameType | null;
  updateActiveGameType: (val: GameType) => void;
  clearQueryParams: () => void;
  parseCsvCustomCards: (
    gameType: GameType,
    csvString: string,
    expectNewGame: boolean
  ) => void;
  sendNotification: (payload: INotification) => void;
}

const App = (props: IProps) => {
  const fileInputRef = useRef();
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [numImageClicks, setNumImageClicks] = useState(0);

  // Set up konami code handler to show / hide dev settings panel
  const toggleDevSetting = () => {
    if (!showDevSettings) {
      setNumImageClicks(0);
    }
    setShowDevSettings(!showDevSettings);
  };

  useKonami(toggleDevSetting);

  // TODO: this might not be necessary any more, but leaving in for
  // a little bit to confirm

  // const onSWUpdate = (registration: ServiceWorkerRegistration) => {
  //   setShowReload(true);
  //   setWaitingWorker(registration.waiting);
  // };

  const clearQueryParams = props.clearQueryParams;
  useEffect(() => {
    clearQueryParams();
  }, [clearQueryParams]);

  useEffect(() => {
    //Default Log Level. Can override in the console with
    if (import.meta.env.MODE !== "production") {
      log.setDefaultLevel("info");
    } else {
      log.setDefaultLevel("warn");
    }

    // Mixpanel
    mixpanel.init("c33a3e2ef8f81f3f8b1d8c4984e72760");
    mixpanel.track("Cardtable loaded");

    // highlight.io
    if (import.meta.env.MODE === "production") {
      // For some reason the FPS is way more impactful
      // on iOS devices, so don't use highlight for those devices
      // const forceDisableHighlightCanvas =
      //   window?.navigator?.userAgent?.includes("AppleWebKit");

      const forceDisableHighlightCanvas = true;

      H.init("zg03k0g9", {
        version: "_REPLACE_VERSION_",
        enableCanvasRecording: !forceDisableHighlightCanvas,
        samplingStrategy: {
          canvasManualSnapshot: 3,
          canvasMaxSnapshotDimension: 480,
        },
        tracingOrigins: true,
        networkRecording: {
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [
            // insert urls you don't want to record here
          ],
        },
      });
    }

    // Service Worker - this was replaced by auto stuff when switching to Vite
    // serviceWorkerRegistration.register({ onUpdate: onSWUpdate });
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShowReload(false);
    window.location.reload();
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
  };

  const action = (
    <React.Fragment>
      <Button color="inherit" size="small" onClick={reloadPage}>
        Reload
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <ConfirmProvider>
        <CssBaseline />
        <NotificationsContainer></NotificationsContainer>
        {showDevSettings && (
          <DevSettings
            onClose={() => {
              setShowDevSettings(false);
            }}
          ></DevSettings>
        )}
        {!!props.activeGameType ? (
          <div>
            <Snackbar
              open={showReload}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              message="New version available"
              action={action}
            />
            <GameContainer
              currentGameType={props.activeGameType}
            ></GameContainer>
          </div>
        ) : (
          <div>
            {legacy
              ? renderGamePickerLegacy(
                  props,
                  toggleDevSetting,
                  numImageClicks,
                  setNumImageClicks,
                  fileInputRef
                )
              : renderGamePicker(
                  props,
                  toggleDevSetting,
                  numImageClicks,
                  setNumImageClicks,
                  fileInputRef
                )}
          </div>
        )}
      </ConfirmProvider>
    </ThemeProvider>
  );
};

const camelCaseToSpaces = (str: string) => {
  // insert a space before all caps
  return (
    str
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, (s) => {
        return s.toUpperCase();
      })
  );
};

const renderGamePicker = (
  props: IProps,
  toggleDevSetting: () => void,
  numImageClicks: number,
  setNumImageClicks: (n: number) => void,
  fileInputRef: React.MutableRefObject<any>
) => {
  return (
    <div className="game-picker">
      <img
        onClick={() => {
          if (numImageClicks >= 9) {
            toggleDevSetting();
            setNumImageClicks(0);
          } else {
            setNumImageClicks(numImageClicks + 1);
          }
        }}
        className="logo"
        alt="cardtable"
        src={mainLogo}
      ></img>

      <div className="game-group">
        {Object.entries(GameType)
          .filter(([_key, value]) =>
            GameManager.allNonHiddenGameTypes.includes(value)
          )
          .map(([key, value]) => {
            const label = camelCaseToSpaces(key);
            const heroImageUrl = GameManager.properties[value].heroImageUrl;
            return (
              <div
                className="game-square-wrapper"
                key={key}
                onClick={() => {
                  props.updateActiveGameType(value);

                  // Cache the common images
                  cacheCommonImages(value);
                }}
              >
                <div className="game-square">
                  {!!heroImageUrl ? (
                    <img alt={label} src={heroImageUrl} />
                  ) : (
                    <>{label}</>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      {showCustomGamesLocalStorage ? (
        <>
          <div>Custom Games</div>

          <div className="game-group">
            <div
              className="game-square-wrapper"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="game-square add-new-game">+</div>
            </div>
            <input
              onChange={(e) => {
                if (!!e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  // setting up the reader
                  const reader = new FileReader();
                  reader.readAsText(file, "UTF-8");

                  // here we tell the reader what to do when it's done reading...
                  reader.onload = (readerEvent) => {
                    const content: string = readerEvent.target
                      ?.result as string; // this is the content!
                    props.parseCsvCustomCards(
                      GameType.StandardDeck,
                      content,
                      true
                    );
                  };
                } else {
                  props.sendNotification({
                    id: v4(),
                    level: "error",
                    message: "Unable to load file",
                    forceDefaultPosition: true,
                  });
                }
                e.target.value = "";
              }}
              multiple={false}
              ref={fileInputRef}
              type="file"
              hidden
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

const renderGamePickerLegacy = (
  props: IProps,
  toggleDevSetting: () => void,
  numImageClicks: number,
  setNumImageClicks: (n: number) => void,
  fileInputRef: React.MutableRefObject<any>
) => {
  return (
    <div className="game-picker">
      <img
        onClick={() => {
          if (numImageClicks >= 9) {
            toggleDevSetting();
            setNumImageClicks(0);
          } else {
            setNumImageClicks(numImageClicks + 1);
          }
        }}
        className="logo"
        alt="cardtable"
        src={mainLogo}
      ></img>

      <FormControl className="select">
        <InputLabel id="game-picker-label">Select Game</InputLabel>
        <Select
          id="game-picker"
          labelId="game-picker-label"
          onChange={(e) => {
            props.updateActiveGameType(e.target.value as GameType);

            // Cache the common images
            cacheCommonImages(e.target.value as GameType);
          }}
          variant={"standard"}
        >
          {Object.entries(GameType)
            .filter(([_key, value]) =>
              GameManager.allNonHiddenGameTypes.includes(value)
            )
            .map(([key, value]) => {
              const label = camelCaseToSpaces(key);
              return (
                <MenuItem key={`menu-item-${key}`} value={value}>
                  {label}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
      <div
        className={`custom-picker ${
          showCustomGamesLocalStorage ? "" : "hidden"
        }`}
      >
        <Button onClick={() => fileInputRef.current.click()} variant="outlined">
          Import Custom Game...
        </Button>
        <input
          onChange={(e) => {
            if (!!e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              // setting up the reader
              const reader = new FileReader();
              reader.readAsText(file, "UTF-8");

              // here we tell the reader what to do when it's done reading...
              reader.onload = (readerEvent) => {
                const content: string = readerEvent.target?.result as string; // this is the content!
                props.parseCsvCustomCards(GameType.StandardDeck, content, true);
              };
            } else {
              props.sendNotification({
                id: v4(),
                level: "error",
                message: "Unable to load file",
                forceDefaultPosition: true,
              });
            }
            e.target.value = "";
          }}
          multiple={false}
          ref={fileInputRef}
          type="file"
          hidden
        />
      </div>
    </div>
  );
};

export default App;
