import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'types/user';

interface UsersState {
  users: Record<string, User>;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: {},
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<Record<string, User>>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users[action.payload.id] = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.users[action.payload.id] = action.payload;
    },
    removeUser: (state, action: PayloadAction<string>) => {
      delete state.users[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setUsers, addUser, updateUser, removeUser, setLoading, setError } = usersSlice.actions;
export default usersSlice.reducer;
