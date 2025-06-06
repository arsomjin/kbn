export const UPDATE_STOCK_VEHICLES = 'UPDATE_STOCK_VEHICLES';
export const UPDATE_STOCK_PARTS = 'UPDATE_STOCK_PARTS';

export const updateStockVehicles = stockVehicles => {
  return {
    type: UPDATE_STOCK_VEHICLES,
    stockVehicles
  };
};

export const updateStockParts = stockParts => {
  return {
    type: UPDATE_STOCK_PARTS,
    stockParts
  };
};
