export const updateAllData = api => {
  api.getBankNames();
  api.getBanks();
  api.getBranches();
  // api.getCustomers(); // To remove.
  api.getDataSources();
  api.getDealers();
  api.getDepartments();
  api.getEmployees();
  api.getExpenseAccountNames();
  // api.getExpenseCategories();
  api.getLocations();
  api.getPermissionCategories();
  api.getPermissions();
  api.getPlants();
  // api.getReferrers(); // To remove.
  api.getUserGroups();
  api.getUsers();
  api.getVehicleLists(); // To remove.
  api.getWarehouses();
  // api.getStockVehicles();
  // api.getStockParts();
};

export const letUpdate = (dataName, api) => {
  switch (dataName) {
    case 'banks':
      api.getBanks();
      break;
    case 'branches':
      api.getBranches();
      break;
    case 'customers':
      api.getCustomers();
      break;
    case 'dealers':
      api.getDealers();
      break;
    case 'departments':
      api.getDepartments();
      break;
    case 'employees':
      api.getEmployees();
      break;
    case 'expenseAccountNames':
      api.getExpenseAccountNames();
      break;
    case 'expenseCategories':
      api.getExpenseCategories();
      break;
    case 'locations':
      api.getLocations();
      break;
    case 'permissionCategories':
      api.getPermissionCategories();
      break;
    case 'permissions':
      api.getPermissions();
      break;
    case 'userGroups':
      api.getUserGroups();
      break;
    case 'users':
      api.getUsers();
      break;
    case 'vehicleList':
      api.getVehicleLists();
      break;
    case 'warehouses':
      api.getWarehouses();
      break;
    case 'referrers':
      api.getReferrers();
      break;
    case 'plants':
      api.getPlants();
      break;
    case 'dataSources':
      api.getDataSources();
      break;
    case 'bankNames':
      api.getBankNames();
      break;
    // case 'stockVehicles':
    //   api.getStockVehicles();
    //   break;
    // case 'stockParts':
    //   api.getStockParts();
    //   break;

    default:
      break;
  }
};

export const getAllPaths = allMenuItems => {
  let result = [
    '/setting-vehicle-model',
    '/setting-branches',
    '/setting-users',
    '/setting-account',
    '/setting-promotions',
    '/customer-details',
    '/customer-details'
  ]; // Extra paths. (etc. from direct click)
  allMenuItems.map(it => {
    if (it.to) {
      result = [...result, it.to];
    }
    if (typeof it.items !== 'undefined') {
      it.items.map(itt => {
        if (itt.to) {
          result = [...result, itt.to];
        }
        if (typeof itt.items !== 'undefined') {
          itt.items.map(ittt => {
            if (ittt.to) {
              result = [...result, ittt.to];
            }
            if (typeof ittt.items !== 'undefined') {
              ittt.items.map(itttt => {
                if (itttt.to) {
                  result = [...result, itttt.to];
                }
                if (typeof itttt.items !== 'undefined') {
                  itttt.items.map(ittttt => {
                    if (ittttt.to) {
                      result = [...result, ittttt.to];
                    }
                    return ittttt;
                  });
                }
                return itttt;
              });
            }
            return ittt;
          });
        }
        return itt;
      });
    }
    return it;
  });
  return result;
};
