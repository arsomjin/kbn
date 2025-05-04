import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, query } from 'firebase/firestore';
import { firestore } from '../../services/firebase';

// Define the Branch interface
export interface Branch {
  id: string;
  name: string;
  code?: string;
  province?: string;
  address?: string;
  isActive?: boolean;
}

// Define the initial state
interface BranchState {
  branches: Branch[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  status: 'idle',
  error: null
};

// Create async thunk for fetching branches
export const fetchBranches = createAsyncThunk('branches/fetchBranches', async () => {
  try {
    const branchesRef = collection(firestore, 'data/company/branches');
    const branchesSnapshot = await getDocs(query(branchesRef));

    const branches = branchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Branch[];

    return branches;
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
});

// Create the branch slice
const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    // Add any synchronous reducers if needed
    resetBranchState: state => {
      state.branches = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBranches.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchBranches.fulfilled, (state, action: PayloadAction<Branch[]>) => {
        state.status = 'succeeded';
        state.branches = action.payload;
        state.error = null;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch branches';
      });
  }
});

export const { resetBranchState } = branchSlice.actions;
export default branchSlice.reducer;
