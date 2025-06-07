/**
 * Province Reducer for KBN Multi-Province System
 * Manages province state and geographic data
 */

import {
  GET_PROVINCES,
  GET_PROVINCES_SUCCESS,
  GET_PROVINCES_FAILURE,
  SET_PROVINCES,
  SET_CURRENT_PROVINCE,
  UPDATE_PROVINCE,
  CREATE_PROVINCE,
  DELETE_PROVINCE,
  SET_PROVINCE_LOADING
} from '../actions/provinces';

const initialState = {
  // Province data
  provinces: {},
  currentProvince: null,
  
  // Loading states
  loading: false,
  error: null,
  
  // Geographic defaults
  defaultProvince: 'nakhon-ratchasima', // สำหรับ backward compatibility
  
  // Cache for computed data
  provincesList: [],
  activeProvinces: [],
  
  // Last updated timestamp
  lastUpdated: null
};

const provincesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PROVINCE_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case GET_PROVINCES:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_PROVINCES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        provinces: action.payload,
        provincesList: Object.keys(action.payload || {}),
        activeProvinces: Object.keys(action.payload || {}).filter(
          key => action.payload[key]?.isActive !== false
        ),
        lastUpdated: Date.now()
      };

    case GET_PROVINCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_PROVINCES:
      return {
        ...state,
        provinces: action.payload,
        provincesList: Object.keys(action.payload || {}),
        activeProvinces: Object.keys(action.payload || {}).filter(
          key => action.payload[key]?.isActive !== false
        ),
        lastUpdated: Date.now()
      };

    case SET_CURRENT_PROVINCE:
      return {
        ...state,
        currentProvince: action.payload
      };

    case UPDATE_PROVINCE: {
      const { provinceKey, updates } = action.payload;
      const updatedProvinces = {
        ...state.provinces,
        [provinceKey]: {
          ...state.provinces[provinceKey],
          ...updates,
          updatedAt: Date.now()
        }
      };

      return {
        ...state,
        provinces: updatedProvinces,
        activeProvinces: Object.keys(updatedProvinces).filter(
          key => updatedProvinces[key]?.isActive !== false
        ),
        lastUpdated: Date.now()
      };
    }

    case CREATE_PROVINCE: {
      const provinceData = action.payload;
      const provinceKey = provinceData.key || provinceData.provinceName;
      
      const updatedProvinces = {
        ...state.provinces,
        [provinceKey]: {
          ...provinceData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      return {
        ...state,
        provinces: updatedProvinces,
        provincesList: Object.keys(updatedProvinces),
        activeProvinces: Object.keys(updatedProvinces).filter(
          key => updatedProvinces[key]?.isActive !== false
        ),
        lastUpdated: Date.now()
      };
    }

    case DELETE_PROVINCE: {
      const provinceKey = action.payload;
      const { [provinceKey]: removed, ...remainingProvinces } = state.provinces;

      return {
        ...state,
        provinces: remainingProvinces,
        provincesList: Object.keys(remainingProvinces),
        activeProvinces: Object.keys(remainingProvinces).filter(
          key => remainingProvinces[key]?.isActive !== false
        ),
        currentProvince: state.currentProvince === provinceKey ? null : state.currentProvince,
        lastUpdated: Date.now()
      };
    }

    default:
      return state;
  }
};

// Selectors
export const getProvinces = (state) => state.provinces.provinces;
export const getCurrentProvince = (state) => state.provinces.currentProvince;
export const getProvincesLoading = (state) => state.provinces.loading;
export const getProvincesError = (state) => state.provinces.error;
export const getProvincesList = (state) => state.provinces.provincesList;
export const getActiveProvinces = (state) => state.provinces.activeProvinces;

export const getProvinceByKey = (state, provinceKey) => 
  state.provinces.provinces[provinceKey] || null;

export const getProvinceOptions = (state) => 
  state.provinces.activeProvinces.map(key => ({
    value: key,
    label: state.provinces.provinces[key]?.provinceName || key,
    labelEn: state.provinces.provinces[key]?.provinceNameEn || key,
    ...state.provinces.provinces[key]
  }));

export const getBranchesByProvince = (state, provinceKey) => {
  const province = state.provinces.provinces[provinceKey];
  return province?.branches || [];
};

export default provincesReducer; 