import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../services/firebase';

// Define the Branch interface
export interface Branch {
  id: string;                 // Document ID
  branchCode: string;         // Unique branch code
  provinceId: string;         // Province identifier
  name: string;              // Branch name
  nameEn: string;            // Branch name in English
  address: {                 // Branch address
    address: string;
    moo?: string;
    village?: string;
    province: string;
    amphoe: string;
    tambol: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  contact: {                 // Contact information
    tel?: string;
    fax?: string;
    email?: string;
    website?: string;
  };
  manager?: string;          // Branch manager user ID
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  status: 'active' | 'inactive' | 'pending' | 'closed';  // Branch status
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
    const branchesQuery = query(branchesRef, where("deleted", "!=", true));
    const branchesSnapshot = await getDocs(branchesQuery);

    const branches = branchesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        branchCode: data.branchCode || '',
        provinceId: data.provinceId || '',
        name: data.name || '',
        nameEn: data.nameEn || '',
        address: {
          address: data.address?.address || '',
          moo: data.address?.moo,
          village: data.address?.village,
          province: data.address?.province || '',
          amphoe: data.address?.amphoe || '',
          tambol: data.address?.tambol || '',
          postcode: data.address?.postcode || '',
          latitude: data.address?.latitude,
          longitude: data.address?.longitude,
        },
        contact: {
          tel: data.contact?.tel,
          fax: data.contact?.fax,
          email: data.contact?.email,
          website: data.contact?.website,
        },
        manager: data.manager,
        created: data.created || Date.now(),
        updated: data.updated,
        inputBy: data.inputBy || '',
        status: data.status || 'active'
      } as Branch;
    });

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
