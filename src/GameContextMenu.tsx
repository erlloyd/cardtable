import { ConfirmOptions, useConfirm } from "material-ui-confirm";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import { ICardStack } from "./features/cards/initialState";
import { TextField } from "@mui/material";
import { IGameState, IRecentlyLoadedDeck } from "./features/game/initialState";
import {
  PlayerColor,
  myPeerRef,
  possibleColors,
  useWebRTCLocalStorage,
} from "./constants/app-constants";
import { DrawCardsOutOfCardStackPayload } from "./features/cards/cards.thunks";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import GameManager from "./game-modules/GameModuleManager";
import { anyCardStackHasStatus, getCardType } from "./utilities/card-utils";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";
import { GameType } from "./game-modules/GameType";
import { ICardData } from "./features/cards-data/initialState";
import { Vector2d } from "konva/lib/types";
import { ICounter } from "./features/counters/initialState";
import { copyToClipboard, generateRemoteGameUrl } from "./utilities/text-utils";

interface IProps {
  confirm?: (options?: ConfirmOptions) => Promise<void>;

  position: Vector2d;
  pointerPosition: Vector2d | null;
  relativePosition: Vector2d;
  gameState: IGameState;
  card: ICardStack | null;
  mySelectedCards: ICardStack[];
  counter: ICounter | null;
  currentGameType: GameType;
  cardsData: ICardData;
  peerId: string;
  recentlyLoadedDecks: IRecentlyLoadedDeck[];

  handleCounterTokenModification: (
    card: ICardStack,
    type: CounterTokenType
  ) => void;
  handleImportDeck: () => void;
  clearContextMenu: () => void;
  handleFindSpecificCard: (card: ICardStack) => void;
  handleShowEncounterLoader: (custom: boolean) => void;
  handleConnectToOnlineGame: () => void;

  showCardPeekForCards: (numCards: number) => void;
  toggleTopCardOfStackFaceup: (id: string) => void;
  addToPlayerHandWithRoleCheck: (payload: { playerNumber: number }) => void;
  drawCardsOutOfCardStack: (payload: DrawCardsOutOfCardStackPayload) => void;
  flipCards: () => void;
  shuffleStack: (id?: string) => void;
  deleteCardStack: (id?: string) => void;
  saveDeckAsJson: (currentGameType: GameType) => void;
  adjustStatusToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    delta: number;
  }) => void;
  toggleToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    value?: boolean;
  }) => void;
  adjustCounterToken: (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }) => void;
  adjustModifier: (payload: {
    id?: string;
    modifierId: string;
    delta?: number;
    value?: number;
  }) => void;
  addExtraIcon: (icon: string) => void;
  removeExtraIcon: (icon: string) => void;
  clearAllModifiers: (payload: { id?: string }) => void;
  removeCounter: (id: string) => void;
  updateCounterValue: (payload: { id: string; delta: number }) => void;
  updateCounterColor: (payload: { id: string; newColor: PlayerColor }) => void;
  createDeckFromJson: (payload: {
    gameType: GameType;
    position: Vector2d;
    jsonContents: string;
  }) => void;
  showDeckSearch: (payload: Vector2d) => void;
  showDeckTextImporter: (pos: Vector2d) => void;
  showSpecificCardLoader: (payload: Vector2d) => void;
  parseCsvCustomCards: (
    gameType: GameType,
    csvString: string,
    expectNewGame: boolean
  ) => void;
  requestResync: (payload: { includeCustomCards: boolean }) => void;
  removeCustomCards: (gameType: GameType) => void;
  addNewPlaymatInColumn: (imgUrl: string) => void;
  resetPlaymats: () => void;
  undo: () => void;
  redo: () => void;
  generateGameStateSave: () => void;
  loadGameStateFromSave: (jsonString: string) => void;
  resetApp: (currentGameType: GameType) => void;
  quitGame: () => void;
  clearHistory: () => void;
  addNewCounter: (
    pos: Vector2d,
    imgurl?: string,
    text?: string,
    color?: PlayerColor
  ) => void;
  removeAllArrows: () => void;
  createNewMultiplayerGame: () => void;
  generateGameStateUrl: () => void;
  loadAndStoreChangelog: () => void;
  clearRecentlyLoadedDecks: () => void;
  fetchRecentDeck: (options: {
    recentDeck: IRecentlyLoadedDeck;
    newLoadPos: Vector2d;
  }) => void;
}

const createCounterContextMenuItems = (props: IProps): ContextMenuItem[] => {
  if (!props.counter) return [];

  const menuItems: ContextMenuItem[] = [
    {
      label: "Remove",
      action: () => {
        props.removeCounter(props.counter!.id);
      },
    },
    {
      label: "Set Value",
      action: () => {
        let numToSet = 0;
        if (props.confirm) {
          props
            .confirm({
              title: "New value?",
              description: "",
              content: (
                <TextField
                  type="number"
                  onChange={(e) => (numToSet = +e.target.value)}
                  onKeyUp={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyPress={(e) => {
                    e.stopPropagation();
                  }}
                ></TextField>
              ),
            })
            .then(() => {
              props.updateCounterValue({
                id: props.counter!.id,
                delta: numToSet - (props.counter?.value ?? 0),
              });
            })
            .catch(() => {
              // do nothing on cancel
            });
        }
      },
    },
    {
      label: "Reset",
      action: () => {
        props.updateCounterValue({
          id: props.counter!.id,
          delta: (props.counter?.value ?? 0) * -1,
        });
      },
    },
    {
      label: "Set Color",
      children: possibleColors.map((color) => {
        return {
          label: color,
          action: () => {
            props.updateCounterColor({
              id: props.counter!.id,
              newColor: color,
            });
          },
        };
      }),
    },
  ];

  return menuItems;
};

const createCardContextMenuItems = (props: IProps): ContextMenuItem[] => {
  const card = props.card;
  const mySelectedCards = props.mySelectedCards;
  const numCardsInStack = card?.cardStack?.length || 0;

  if (!card && !mySelectedCards) return [];

  const menuItems: ContextMenuItem[] = [
    {
      label: "Peek",
      children: [
        {
          label: "Peek at 1",
          action: () => {
            props.showCardPeekForCards(1);
          },
        },
        {
          label: "Peek at 3",
          action: () => {
            props.showCardPeekForCards(3);
          },
        },
        {
          label: "Peek at 5",
          action: () => {
            props.showCardPeekForCards(5);
          },
        },
        {
          label: "Peek at 10",
          action: () => {
            props.showCardPeekForCards(10);
          },
        },
        {
          label: "Peek at X",
          action: () => {
            if (props.confirm) {
              let numToPeek = 5;
              props
                .confirm({
                  title: "How many?",
                  description: "",
                  content: (
                    <TextField
                      type="number"
                      onChange={(e) => (numToPeek = +e.target.value)}
                      onKeyUp={(e) => {
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      onKeyPress={(e) => {
                        e.stopPropagation();
                      }}
                    ></TextField>
                  ),
                })
                .then(() => {
                  props.showCardPeekForCards(numToPeek);
                })
                .catch(() => {
                  // do nothing on cancel
                });
            }
          },
        },
        {
          label: `Top card ${card?.topCardFaceup ? "facedown" : "faceup"}`,
          action: () => {
            props.toggleTopCardOfStackFaceup(card?.id ?? "");
          },
        },
      ],
      hidden:
        mySelectedCards.length !== 1 || mySelectedCards[0].cardStack.length < 2,
    },
    {
      label: `Add ${
        mySelectedCards.length > 1 ||
        (mySelectedCards.length > 0 && mySelectedCards[0].cardStack.length > 1)
          ? "all "
          : ""
      } to hand`,
      action: () => {
        props.addToPlayerHandWithRoleCheck({
          playerNumber:
            props.gameState.currentVisiblePlayerHandNumber ??
            props.gameState.playerNumbers[myPeerRef],
        });
      },
    },
    {
      label: `Place all on table`,
      action: () => {
        props.drawCardsOutOfCardStack({
          cardStackId: mySelectedCards[0].id,
          numberToDraw: mySelectedCards[0].cardStack.length,
          facedown: false,
          forceOnTable: true,
        });
      },
      hidden:
        mySelectedCards.length !== 1 || mySelectedCards[0].cardStack.length < 2,
    },
    {
      label: "Flip",
      action: () => {
        props.flipCards();
      },
    },
  ];

  if (numCardsInStack > 1) {
    menuItems.push({
      label: "Shuffle",
      action: () => {
        props.shuffleStack();
      },
    });

    menuItems.push({
      label: "Find Specific Card",
      action: () => {
        if (!!card) {
          props.handleFindSpecificCard(card);
        }
      },
    });
  }

  menuItems.push({
    label: "Delete",
    action: () => {
      props.deleteCardStack();
    },
  });

  menuItems.push({
    label: "Save Deck(s) as json file",
    action: () => {
      props.saveDeckAsJson(props.currentGameType);
    },
  });

  const defaultTokenInfoForGameType =
    GamePropertiesMap[props.currentGameType].tokens;

  let tokenInfoForGameType = defaultTokenInfoForGameType;

  if (
    !!GameManager.getModuleForType(props.currentGameType)
      .getCustomTokenInfoForCard &&
    mySelectedCards.length > 0
  ) {
    tokenInfoForGameType =
      GameManager.getModuleForType(props.currentGameType)
        .getCustomTokenInfoForCard!!(
        mySelectedCards[0],
        getCardType(mySelectedCards[0], props.cardsData),
        defaultTokenInfoForGameType
      ) ?? defaultTokenInfoForGameType;
  }

  if (!!tokenInfoForGameType.stunned) {
    if (tokenInfoForGameType.stunned.canStackMultiple) {
      // Add status token
      menuItems.push({
        label: `Add ${tokenInfoForGameType.stunned.menuText}`,
        action: () => {
          props.adjustStatusToken({
            tokenType: StatusTokenType.Stunned,
            delta: 1,
          });
        },
      });

      if (card?.statusTokens?.stunned ?? -1 > 0) {
        // Remove status token
        menuItems.push({
          label: `Remove ${tokenInfoForGameType.stunned.menuText}`,
          action: () => {
            props.adjustStatusToken({
              tokenType: StatusTokenType.Stunned,
              delta: -1,
            });
          },
        });
      }
    } else {
      menuItems.push({
        label: anyCardStackHasStatus(StatusTokenType.Stunned, mySelectedCards)
          ? tokenInfoForGameType.stunned.menuRemoveText
          : tokenInfoForGameType.stunned.menuText,
        action: () => {
          props.toggleToken({
            id: card?.id || "",
            tokenType: StatusTokenType.Stunned,
            value: !anyCardStackHasStatus(
              StatusTokenType.Stunned,
              mySelectedCards
            ),
          });
        },
      });
    }
  }

  if (!!tokenInfoForGameType.confused) {
    if (tokenInfoForGameType.confused.canStackMultiple) {
      // Add status token
      menuItems.push({
        label: `Add ${tokenInfoForGameType.confused.menuText}`,
        action: () => {
          props.adjustStatusToken({
            tokenType: StatusTokenType.Confused,
            delta: 1,
          });
        },
      });

      if (card?.statusTokens?.confused ?? -1 > 0) {
        // Remove status token
        menuItems.push({
          label: `Remove ${tokenInfoForGameType.confused.menuText}`,
          action: () => {
            props.adjustStatusToken({
              tokenType: StatusTokenType.Confused,
              delta: -1,
            });
          },
        });
      }
    } else {
      menuItems.push({
        label: anyCardStackHasStatus(StatusTokenType.Confused, mySelectedCards)
          ? tokenInfoForGameType.confused.menuRemoveText
          : tokenInfoForGameType.confused.menuText,
        action: () => {
          props.toggleToken({
            id: card?.id || "",
            tokenType: StatusTokenType.Confused,
            value: !anyCardStackHasStatus(
              StatusTokenType.Confused,
              mySelectedCards
            ),
          });
        },
      });
    }
  }

  if (!!tokenInfoForGameType.tough) {
    if (tokenInfoForGameType.tough.canStackMultiple) {
      // Add status token
      menuItems.push({
        label: `Add ${tokenInfoForGameType.tough.menuText}`,
        action: () => {
          props.adjustStatusToken({
            tokenType: StatusTokenType.Tough,
            delta: 1,
          });
        },
      });

      if (card?.statusTokens?.tough ?? -1 > 0) {
        // Remove status token
        menuItems.push({
          label: `Remove ${tokenInfoForGameType.tough.menuText}`,
          action: () => {
            props.adjustStatusToken({
              tokenType: StatusTokenType.Tough,
              delta: -1,
            });
          },
        });
      }
    } else {
      menuItems.push({
        label: anyCardStackHasStatus(StatusTokenType.Tough, mySelectedCards)
          ? tokenInfoForGameType.tough.menuRemoveText
          : tokenInfoForGameType.tough.menuText,
        action: () => {
          props.toggleToken({
            id: card?.id || "",
            tokenType: StatusTokenType.Tough,
            value: !anyCardStackHasStatus(
              StatusTokenType.Tough,
              mySelectedCards
            ),
          });
        },
      });
    }
  }

  if (!!tokenInfoForGameType.damage) {
    menuItems.push({
      label: tokenInfoForGameType.damage.menuText,
      action: () => {
        if (card) {
          props.handleCounterTokenModification(card, CounterTokenType.Damage);
        }
      },
    });
  }

  if (!!tokenInfoForGameType.threat) {
    menuItems.push({
      label: tokenInfoForGameType.threat.menuText,
      action: () => {
        if (card) {
          props.handleCounterTokenModification(card, CounterTokenType.Threat);
        }
      },
    });
  }

  if (!!tokenInfoForGameType.generic) {
    menuItems.push({
      label: tokenInfoForGameType.generic.menuText,
      action: () => {
        if (card) {
          props.handleCounterTokenModification(card, CounterTokenType.Generic);
        }
      },
    });
  }

  if (!!tokenInfoForGameType.acceleration) {
    menuItems.push({
      label: tokenInfoForGameType.acceleration.menuText,
      action: () => {
        if (card) {
          props.handleCounterTokenModification(
            card,
            CounterTokenType.Acceleration
          );
        }
      },
    });
  }

  menuItems.push({
    label: "Remove All Tokens",
    action: () => {
      props.adjustCounterToken({
        id: card?.id || "",
        tokenType: CounterTokenType.Damage,
        value: 0,
      });

      props.adjustCounterToken({
        id: card?.id || "",
        tokenType: CounterTokenType.Threat,
        value: 0,
      });

      props.adjustCounterToken({
        id: card?.id || "",
        tokenType: CounterTokenType.Generic,
        value: 0,
      });

      props.adjustCounterToken({
        id: card?.id || "",
        tokenType: CounterTokenType.Acceleration,
        value: 0,
      });
    },
  });

  const modifiersForGameType =
    GamePropertiesMap[props.currentGameType].modifiers;

  const extraIconsForGameType =
    GamePropertiesMap[props.currentGameType].possibleIcons;

  if (modifiersForGameType.length > 0 || extraIconsForGameType.length > 0) {
    menuItems.push({
      label: "Modifiers",
      children: modifiersForGameType
        .map((m) => {
          return {
            label: m.attributeName,
            children: [
              {
                label: "Add 1",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    delta: 1,
                  });
                },
              },
              {
                label: "Remove 1",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    delta: -1,
                  });
                },
              },
              {
                label: "-3",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: -3,
                  });
                },
              },
              {
                label: "-2",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: -2,
                  });
                },
              },
              {
                label: "-1",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: -1,
                  });
                },
              },
              {
                label: "0",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: 0,
                  });
                },
              },
              {
                label: "1",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: 1,
                  });
                },
              },
              {
                label: "2",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: 2,
                  });
                },
              },
              {
                label: "3",
                action: () => {
                  props.adjustModifier({
                    id: card?.id || "",
                    modifierId: m.attributeId,
                    value: 3,
                  });
                },
              },
            ],
          } as ContextMenuItem;
        })
        .concat(
          extraIconsForGameType.length > 0
            ? [
                {
                  label: "Add Icon",
                  children: extraIconsForGameType.map((icon) => ({
                    label: icon.iconName,
                    action: () => {
                      props.addExtraIcon(icon.iconId);
                    },
                  })),
                },
                {
                  label: "Remove Icon",
                  children: extraIconsForGameType.map((icon) => ({
                    label: icon.iconName,
                    action: () => {
                      props.removeExtraIcon(icon.iconId);
                    },
                  })),
                },
              ]
            : []
        )
        .concat([
          {
            label: "Clear all modifiers",
            action: () => {
              props.clearAllModifiers({ id: card?.id || "" });
            },
          },
        ]),
    });
  }

  return menuItems;
};

const createGlobalContextMenuItems = (props: IProps): ContextMenuItem[] => {
  const additionalResources =
    GameManager.getModuleForType(props.currentGameType).properties
      .additionalResourcesUris ?? [];

  const menuItems: ContextMenuItem[] = [
    {
      label: "Import / Load",
      children: [
        {
          label: "Recently Loaded Decks",
          children: props.recentlyLoadedDecks
            .map((rld) => ({
              label: rld.displayName,
              action: () => {
                props.fetchRecentDeck({
                  recentDeck: rld,
                  newLoadPos: props.relativePosition,
                });
              },
            }))
            .concat([
              {
                label: "Clear Recently Loaded Decks",
                action: () => {
                  props.clearRecentlyLoadedDecks();
                },
              },
            ]),
          hidden: props.recentlyLoadedDecks.length === 0,
        },
        {
          label: "Load Deck(s) from json file",
          fileLoadedAction: (jsonContents: string) => {
            props.createDeckFromJson({
              gameType: props.currentGameType,
              position: props.pointerPosition ?? { x: 0, y: 0 },
              jsonContents,
            });
          },
          fileUploader: true,
        },
        {
          label: "Import Deck by ID",
          action: () => {
            props.handleImportDeck();
          },
          hidden: !GamePropertiesMap[props.currentGameType].decklistApi,
        },
        {
          label: `Search for Online Deck to Import`,
          action: () => {
            props.showDeckSearch(props.pointerPosition || { x: 0, y: 0 });
          },
          hidden: !GamePropertiesMap[props.currentGameType].decklistSearchApi,
        },
        {
          label: "Import Deck from Text",
          action: () => {
            props.showDeckTextImporter(
              props.pointerPosition || { x: 100, y: 100 }
            );
          },
          hidden: !GameManager.getModuleForType(props.currentGameType)
            .loadDeckFromText,
        },
        {
          label: `Load ${
            GamePropertiesMap[props.currentGameType].encounterUiName
          }`,
          action: () => {
            props.handleShowEncounterLoader(false);
          },
          hidden: !GamePropertiesMap[props.currentGameType].encounterUiName,
        },
        {
          label: `Load Specific Card`,
          action: () => {
            props.showSpecificCardLoader(
              props.pointerPosition || { x: 0, y: 0 }
            );
          },
          hidden:
            !GamePropertiesMap[props.currentGameType].allowSpecificCardSearch,
        },
        {
          label: "Load Additional Resources",
          children: additionalResources.map((ar) => ({
            label: ar.display,
            action: () => {
              window.open(ar.url, "_blank", "noreferrer");
            },
          })),
          hidden: additionalResources.length === 0,
        },
      ],
    },
    {
      label: "Custom Content",
      children: [
        {
          label: "Import Custom Cards",
          fileLoadedAction: (csvContents: string) => {
            props.parseCsvCustomCards(
              props.currentGameType,
              csvContents,
              false // don't allow full games to be loaded here
            );
          },
          fileUploader: true,
        },
        {
          label: "Load Custom Sets",
          action: () => {
            props.handleShowEncounterLoader(true);
          },
        },
        {
          label: "Sync All Custom Cards from Online Game",
          action: () => {
            props.requestResync({ includeCustomCards: true });
          },
        },
        {
          label: "Remove All Custom Data for this Game",
          action: () => {
            props.removeCustomCards(props.currentGameType);
          },
        },
      ],
    },
    {
      label: "Playmats",
      children: [
        {
          label: "Change initial playmat image",
          action: () => {
            if (props.confirm) {
              let imageToLoad = "";
              props
                .confirm({
                  title: "Image Url?",
                  description: "",
                  content: (
                    <TextField
                      className="playmat-image-textbox"
                      onChange={(e) => {
                        imageToLoad = e.target.value;
                      }}
                      onKeyUp={(e) => {
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      onKeyPress={(e) => {
                        e.stopPropagation();
                      }}
                    ></TextField>
                  ),
                })
                .then(() => {
                  console.log(imageToLoad);
                })
                .catch(() => {
                  // do nothing on cancel
                });
            }
          },
          hidden: true,
        },
        {
          label: "Reset initial playmat image",
          action: () => {},
          hidden: true,
        },
        {
          label: "Add Playmat",
          children: GamePropertiesMap[
            props.currentGameType
          ].additionalPlaymatImageOptions?.additionalImages.map((po) => ({
            label: po.displayName,
            action: () => {
              props.addNewPlaymatInColumn(po.imgUrl);
            },
          })),
          hidden:
            !GamePropertiesMap[props.currentGameType]
              .additionalPlaymatImageOptions,
        },
        {
          label: "Reset Playmats",
          action: () => {
            props.resetPlaymats();
          },
          hidden:
            !GamePropertiesMap[props.currentGameType]
              .additionalPlaymatImageOptions,
        },
      ],
      hidden:
        !GamePropertiesMap[props.currentGameType].additionalPlaymatImageOptions,
    },
    {
      label: "Undo",
      action: props.undo,
    },
    {
      label: "Redo",
      action: props.redo,
    },
    {
      label: `Save game`,
      action: () => {
        props.generateGameStateSave();
      },
    },
    {
      label: "Load game",
      fileLoadedAction: (jsonContents: string) => {
        props.loadGameStateFromSave(jsonContents);
      },
      fileUploader: true,
    },
    {
      label: "Reset Game",
      action: () => {
        if (props.confirm) {
          props
            .confirm({
              description: "This will reset the game",
            })
            .then(() => {
              props.resetApp(props.currentGameType);
            })
            .catch(() => {
              // do nothing on cancel
            });
        }
      },
    },
    {
      label: "Quit Game",
      action: () => {
        if (props.confirm) {
          props
            .confirm({
              description: "This will take you back to game selection screen",
            })
            .then(() => {
              props.resetApp(props.currentGameType);
              props.quitGame();
              props.clearHistory();
            })
            .catch(() => {
              // do nothing on cancel
            });
        }
      },
    },
    {
      label: "Create new counter",
      children: [
        {
          label: "Generic",
          action: () => {
            props.addNewCounter(props.relativePosition);
          },
        },
      ]
        .concat(
          (GamePropertiesMap[props.currentGameType].iconCounters || []).map(
            (c) => ({
              label: c.counterName,
              action: () => {
                props.addNewCounter(
                  props.relativePosition,
                  c.counterImage,
                  undefined,
                  c.counterColor
                );
              },
            })
          )
        )
        .concat(
          (GamePropertiesMap[props.currentGameType].textCounters || []).map(
            (c) => ({
              label: c.counterName,
              action: () => {
                props.addNewCounter(
                  props.relativePosition,
                  undefined,
                  c.counterText,
                  c.counterColor
                );
              },
            })
          )
        ),
    },
    { label: "Remove all arrows", action: props.removeAllArrows },
    {
      label: "",
      labelHTML: "Multiplayer <span><b>(BETA)</b></span>",
      children: [
        {
          label: "Connect to online game",
          action: () => {
            props.handleConnectToOnlineGame();
          },
        },
        {
          label: "Request resync from Remote Game",
          action: () => {
            props.requestResync({ includeCustomCards: false });
          },
        },
        {
          label: `Copy my online game link`,
          action: () => {
            if (!!props.peerId) {
              copyToClipboard(generateRemoteGameUrl(props.peerId));
            }
          },
        },
      ]
        .concat(
          !!props.peerId
            ? [
                {
                  label: `Peer id is ${props.peerId} (click to copy)`,
                  action: () => {
                    if (!!props.peerId) {
                      copyToClipboard(props.peerId);
                    }
                  },
                },
              ]
            : []
        )
        .concat(
          useWebRTCLocalStorage
            ? []
            : [
                {
                  label: `Start hosting a new online game`,
                  action: () => {
                    props.createNewMultiplayerGame();
                  },
                },
              ]
        )
        .concat([
          {
            label: `Leave multiplayer game`,
            action: () => {
              const url = new URL(window.location as any);
              if (!!url.searchParams.get("remote")) {
                url.searchParams.delete("remote");
              }
              window.history.pushState({}, "", url);
              window.location.reload();
            },
          },
        ]),
    },
    {
      label: `Copy game to clipboard`,
      action: () => {
        props.generateGameStateUrl();
      },
    },
    {
      label: `Version _REPLACE_VERSION_`,
      action: props.loadAndStoreChangelog,
    },
  ];

  return menuItems;
};

const GameContextMenu = (props: IProps) => {
  let menuItems: ContextMenuItem[] = [];
  if (props.card) {
    menuItems = createCardContextMenuItems(props);
  } else if (props.counter) {
    menuItems = createCounterContextMenuItems(props);
  } else {
    menuItems = createGlobalContextMenuItems(props);
  }

  return (
    <ContextMenu
      position={props.position}
      items={menuItems}
      hideContextMenu={() => props.clearContextMenu()}
    ></ContextMenu>
  );
};

export default GameContextMenu;
