/**
 * Province Actions for KBN Multi-Province System
 * Handles all province-related Redux actions
 */

// Action Types
export const GET_PROVINCES = 'GET_PROVINCES';
export const GET_PROVINCES_SUCCESS = 'GET_PROVINCES_SUCCESS';
export const GET_PROVINCES_FAILURE = 'GET_PROVINCES_FAILURE';
export const SET_PROVINCES = 'SET_PROVINCES';
export const SET_CURRENT_PROVINCE = 'SET_CURRENT_PROVINCE';
export const UPDATE_PROVINCE = 'UPDATE_PROVINCE';
export const CREATE_PROVINCE = 'CREATE_PROVINCE';
export const DELETE_PROVINCE = 'DELETE_PROVINCE';
export const SET_PROVINCE_LOADING = 'SET_PROVINCE_LOADING';

// Action Creators
export const setProvinces = (provinces) => ({
  type: SET_PROVINCES,
  payload: provinces
});

export const setCurrentProvince = (provinceKey) => ({
  type: SET_CURRENT_PROVINCE,
  payload: provinceKey
});

export const updateProvince = (provinceKey, updates) => ({
  type: UPDATE_PROVINCE,
  payload: { provinceKey, updates }
});

export const createProvince = (provinceData) => ({
  type: CREATE_PROVINCE,
  payload: provinceData
});

export const deleteProvince = (provinceKey) => ({
  type: DELETE_PROVINCE,
  payload: provinceKey
});

export const setProvinceLoading = (loading) => ({
  type: SET_PROVINCE_LOADING,
  payload: loading
});

export const getProvincesSuccess = (provinces) => ({
  type: GET_PROVINCES_SUCCESS,
  payload: provinces
});

export const getProvincesFailure = (error) => ({
  type: GET_PROVINCES_FAILURE,
  payload: error
});

// Async Action Creators (Thunks)
export const fetchProvinces = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(setProvinceLoading(true));
      
      // Get Firebase API from context - will be injected by Firebase context
      const { api } = getState().firebase || {};
      
      if (api && api.getProvinces) {
        const provinces = await api.getProvinces();
        dispatch(getProvincesSuccess(provinces));
        dispatch(setProvinces(provinces));
      } else {
        console.warn('Firebase API not available for provinces');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      dispatch(getProvincesFailure(error.message));
    } finally {
      dispatch(setProvinceLoading(false));
    }
  };
};

export const saveProvince = (provinceData) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setProvinceLoading(true));
      
      const { api } = getState().firebase || {};
      
      if (api && api.setProvince) {
        await api.setProvince(provinceData);
        dispatch(createProvince(provinceData));
        
        // Refresh provinces list
        dispatch(fetchProvinces());
      }
    } catch (error) {
      console.error('Error saving province:', error);
      dispatch(getProvincesFailure(error.message));
    } finally {
      dispatch(setProvinceLoading(false));
    }
  };
};

export const removeProvince = (provinceKey) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setProvinceLoading(true));
      
      const { api } = getState().firebase || {};
      
      if (api && api.deleteProvince) {
        await api.deleteProvince(provinceKey);
        dispatch(deleteProvince(provinceKey));
      }
    } catch (error) {
      console.error('Error deleting province:', error);
      dispatch(getProvincesFailure(error.message));
    } finally {
      dispatch(setProvinceLoading(false));
    }
  };
}; 