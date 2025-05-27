import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bankNames: {},
  banks: {},
  branches: {},
  dealers: {},
  departments: {},
  employees: {},
  expenseAccountNames: {},
  expenseCategories: {},
  giveaways: {},
  locations: {},
  permissions: {},
  plants: {},
  users: {},
  warehouses: {},
  products: [],
  customers: {},
  referrers: {},
  vehicles: {},
  vehicleList: {},
  modelList: {},
  equipmentLists: {},
  userGroups: {},
  permissionCategories: {},
  notifications: [],
  isMessagingSupported: true,
  updates: null,
  allEmployees: {},
  dataSources: {},
  executives: {},
  services: {},
  isLoading: false,
  error: null,
  provinces: {},
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBanks: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.banks[key];
          } else {
            state.banks[key] = value;
          }
        });
      } else {
        state.banks = changes;
      }
    },
    setBankNames: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.bankNames[key];
          } else {
            state.bankNames[key] = value;
          }
        });
      } else {
        state.bankNames = changes;
      }
    },
    setDealers: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.dealers[key];
          } else {
            state.dealers[key] = value;
          }
        });
      } else {
        state.dealers = changes;
      }
    },
    setDataLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDataError: (state, action) => {
      state.error = action.payload;
    },
    setBranches: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.branches[key];
          } else {
            state.branches[key] = value;
          }
        });
      } else {
        state.branches = changes;
      }
    },
    setProvinces: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.provinces[key];
          } else {
            state.provinces[key] = value;
          }
        });
      } else {
        state.provinces = changes;
      }
    },
    setDepartments: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.departments[key];
          } else {
            state.departments[key] = value;
          }
        });
      } else {
        state.departments = changes;
      }
    },
    setEmployees: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.employees[key];
          } else {
            state.employees[key] = value;
          }
        });
      } else {
        state.employees = changes;
      }
    },
    setExpenseAccountNames: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.expenseAccountNames[key];
          } else {
            state.expenseAccountNames[key] = value;
          }
        });
      } else {
        state.expenseAccountNames = changes;
      }
    },
    setExpenseCategories: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.expenseCategories[key];
          } else {
            state.expenseCategories[key] = value;
          }
        });
      } else {
        state.expenseCategories = changes;
      }
    },
    setGiveaways: (state, action) => {
      state.giveaways = action.payload;
    },
    setLocations: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.locations[key];
          } else {
            state.locations[key] = value;
          }
        });
      } else {
        state.locations = changes;
      }
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    setPlants: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.plants[key];
          } else {
            state.plants[key] = value;
          }
        });
      } else {
        state.plants = changes;
      }
    },
    setUsers: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.users[key];
          } else {
            state.users[key] = value;
          }
        });
      } else {
        state.users = changes;
      }
    },
    setWarehouses: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.warehouses[key];
          } else {
            state.warehouses[key] = value;
          }
        });
      } else {
        state.warehouses = changes;
      }
    },
    setProducts: (state, action) => {
      const [products, isPartial] = action.payload;
      if (isPartial) {
        state.products = [...state.products, ...products];
      } else {
        state.products = products;
      }
    },
    setCustomers: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.customers[key];
          } else {
            state.customers[key] = value;
          }
        });
      } else {
        state.customers = changes;
      }
    },
    setReferrers: (state, action) => {
      state.referrers = action.payload;
    },
    setVehicles: (state, action) => {
      state.vehicles = action.payload;
    },
    setVehicleList: (state, action) => {
      state.vehicleList = action.payload;
    },
    setModelList: (state, action) => {
      state.modelList = action.payload;
    },
    setEquipmentLists: (state, action) => {
      state.equipmentLists = action.payload;
    },
    setUserGroups: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.userGroups[key];
          } else {
            state.userGroups[key] = value;
          }
        });
      } else {
        state.userGroups = changes;
      }
    },
    setPermissionCategories: (state, action) => {
      state.permissionCategories = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setIsMessagingSupported: (state, action) => {
      state.isMessagingSupported = action.payload;
    },
    setUpdates: (state, action) => {
      state.updates = action.payload;
    },
    setAllEmployees: (state, action) => {
      state.allEmployees = action.payload;
    },
    setDataSources: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.dataSources[key];
          } else {
            state.dataSources[key] = value;
          }
        });
      } else {
        state.dataSources = changes;
      }
    },
    setExecutives: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.executives[key];
          } else {
            state.executives[key] = value;
          }
        });
      } else {
        state.executives = changes;
      }
    },
    setServices: (state, action) => {
      state.services = action.payload;
    },
  },
});

export const {
  setBanks,
  setBankNames,
  setDealers,
  setDataLoading,
  setDataError,
  setBranches,
  setProvinces,
  setDepartments,
  setEmployees,
  setExpenseAccountNames,
  setExpenseCategories,
  setGiveaways,
  setLocations,
  setPermissions,
  setPlants,
  setUsers,
  setWarehouses,
  setProducts,
  setCustomers,
  setReferrers,
  setVehicles,
  setVehicleList,
  setModelList,
  setEquipmentLists,
  setUserGroups,
  setPermissionCategories,
  setNotifications,
  setIsMessagingSupported,
  setUpdates,
  setAllEmployees,
  setDataSources,
  setExecutives,
  setServices,
} = dataSlice.actions;

export default dataSlice.reducer;
