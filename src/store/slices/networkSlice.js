import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOnline: navigator.onLine || true,
  lastOnlineTime: Date.now(),
  lastOfflineTime: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    goOnline: (state) => {
      state.isOnline = true;
      state.lastOnlineTime = Date.now();
    },
    goOffline: (state) => {
      state.isOnline = false;
      state.lastOfflineTime = Date.now();
    },
    setNetworkStatus: (state, action) => {
      state.isOnline = action.payload;
      if (action.payload) {
        state.lastOnlineTime = Date.now();
      } else {
        state.lastOfflineTime = Date.now();
      }
    },
  },
});

export const { goOnline, goOffline, setNetworkStatus } = networkSlice.actions;
export default networkSlice.reducer;
