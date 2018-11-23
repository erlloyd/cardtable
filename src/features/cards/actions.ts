// tslint:disable:object-literal-sort-keys
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
  return (id: number) => resolve({id});
});

export const selectMultipleCards = createAction('cards/SELECT_MULTIPLE', resolve => {
  return (ids: number[]) => resolve({ids});
});

export const unselectAllCards = createAction('cards/UNSELECT_ALL');