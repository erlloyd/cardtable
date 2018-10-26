// tslint:disable:object-literal-sort-keys
// import { CARD_MOVE, SELECT_MUTLIPLE_CARDS, UNSELECT_ALL_CARDS } from "./actionTypes";
import { createAction } from 'typesafe-actions';

export const exhaustCard = createAction('cards/EXHAUST_CARD', resolve => {
  return (id: number) => resolve({id});
});

export const startCardMove = createAction('cards/START_MOVE', resolve => {
  return (id: number) => resolve({id});
});

export const moveCard = createAction('cards/MOVE', resolve => {
  return (id: number, dx: number, dy: number) => resolve({id, dx, dy});
});

export const endCardMove = createAction('cards/END_MOVE', resolve => {
  return (id: number) => resolve({id});
});

export const selectCard = createAction('cards/SELECT', resolve => {
  return (id: number) => {
    return resolve({id})
  };
});

export const selectMultipleCards = createAction('cards/SELECT_MULTIPLE', resolve => {
  return (ids: number[]) => resolve({ids});
});

export const unselectAllCards = createAction('cards/UNSELECT_ALL');

// export const simpleCardAction = (type: any, id: any) => {
//   return (dispatch: any) => {
//     dispatch({
//       type,
//       payload: {
//         id
//       }
//     })
//   }
// }

// export const cardMove = (id: any, dx: any, dy: any) => {
//   return (dispatch: any) => {
//     dispatch({
//       type: CARD_MOVE,
//       payload: {
//         id,
//         dx,
//         dy
//       }
//     })
//   }
// }

// export const selectMultipleCards = (ids: any) => {
//   return (dispatch: any) => {
//     dispatch({
//       type: SELECT_MUTLIPLE_CARDS,
//       payload: {
//         ids
//       }
//     });
//   }
// }

// export const unselectAllCards = () => {
//   return (dispatch: any) => {
//     dispatch({
//       type: UNSELECT_ALL_CARDS,
//       payload: {}
//     });
//   }
// }