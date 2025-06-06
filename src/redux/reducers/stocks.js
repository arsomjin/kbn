import { UPDATE_STOCK_VEHICLES, UPDATE_STOCK_PARTS } from '../actions/stocks';

const initialState = {
  stockVehicles: {},
  stockParts: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_STOCK_VEHICLES:
      return {
        ...state,
        stockVehicles: action.stockVehicles
      };
    case UPDATE_STOCK_PARTS:
      return {
        ...state,
        stockParts: action.stockParts
      };
    default:
      return state;
  }
}
