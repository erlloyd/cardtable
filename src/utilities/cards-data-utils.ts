import { CardData as CardDataLOTR } from "../external-api/beorn-json-data";

export const getCardCodeIncludingOverrides = (card: CardDataLOTR): string => {
  let code = card.RingsDbCardId;
  if (Object.keys(cardDataSetCodeOverride).includes(card.CardSet)) {
    code = cardDataSetCodeOverride[card.CardSet](card.RingsDbCardId);
  }
  return code;
};

export const cardDataSetCodeOverride: { [key: string]: (s: string) => string } =
  {
    "The Gap of Rohan": (code: string) => {
      let returnCode = code;
      if (!!code && code[0] === "0") {
        returnCode = `303${code.substring(2)}`;
      }

      return returnCode;
    },
  };
