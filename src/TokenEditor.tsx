import { badgeClasses, Button } from "@mui/material";
import "./TokenEditor.scss";
import TopLayer from "./TopLayer";
import { GameType } from "./game-modules/GameType";
import GameManager from "./game-modules/GameModuleManager";
import { ITokenBag } from "./features/token-bags/initialState";
interface IProps {
  currentGameType: GameType;
  visible: boolean;
  bag: ITokenBag | null;
  viewOnly: boolean;

  hideTokenBagEditor: () => void;
  addTokenToBagWithCode: (payload: { id: string; code: string }) => void;
  removeTokenFromBagWithCode: (payload: { id: string; code: string }) => void;
}

const TokenEditor = (props: IProps) => {
  if (!props.visible || !props.bag) return null;

  const possibleTokensForBag = GameManager.getModuleForType(
    props.currentGameType
  ).properties.tokenBags?.find((b) => b.code === props.bag?.code)?.tokens;

  const tokensToDisplay = possibleTokensForBag ?? [];

  return (
    <TopLayer
      staticPosition={true}
      trasparentBackground={true}
      offsetContent={false}
      position={{ x: 0, y: 0 }}
      noPadding={true}
      fullHeight={true}
      fullWidth={true}
      completed={() => {}}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="token-editor-wrapper"
      >
        <div
          className="buttons"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* For now, we need this here so it pushes the done button to the right side */}
          <div className="button-group"></div>
          <div className="button-group">
            <Button variant={"contained"} onClick={props.hideTokenBagEditor}>
              Done
            </Button>
          </div>
        </div>
        <div className="peek-content">
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="token-list"
          >
            {tokensToDisplay.map((t) => {
              // get the current number from the real bag
              const tokenFromBag = props.bag?.tokens.find(
                (tfb) => tfb.code === t.code
              );
              const numInBag = tokenFromBag?.currentNumberInBag ?? 0;

              return (
                <div key={t.code} className="token-modifier">
                  <div className="border-box-div">
                    <div className="num-adjuster">
                      {!props.viewOnly && (
                        <Button
                          variant="contained"
                          onClick={() => {
                            props.removeTokenFromBagWithCode({
                              id: props.bag!.id,
                              code: t.code,
                            });
                          }}
                        >
                          -
                        </Button>
                      )}

                      <div>In Bag: {numInBag}</div>
                      <img src={t.frontImgUrl} />
                      {!props.viewOnly && (
                        <Button
                          variant="contained"
                          onClick={() => {
                            props.addTokenToBagWithCode({
                              id: props.bag!.id,
                              code: t.code,
                            });
                          }}
                        >
                          +
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TopLayer>
  );
};

export default TokenEditor;
