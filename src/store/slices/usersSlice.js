import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: {},
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    addUser: (state, action) => {
      state.users[action.payload.id] = action.payload;
    },
    updateUser: (state, action) => {
      state.users[action.payload.id] = action.payload;
    },
    removeUser: (state, action) => {
      delete state.users[action.payload];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setUsers, addUser, updateUser, removeUser, setLoading, setError } = usersSlice.actions;
export default usersSlice.reducer; 