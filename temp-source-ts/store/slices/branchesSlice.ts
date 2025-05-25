import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { Branch } from '../../types/branch';

interface BranchesState {
  byProvince: {
    [provinceId: string]: Branch[];
  };
  loading: boolean;
  error: string | null;
  lastFetched: {
    [provinceId: string]: number;
  };
}

const initialState: BranchesState = {
  byProvince: {},
  loading: false,
  error: null,
  lastFetched: {}
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchBranchesByProvince = createAsyncThunk(
  'branches/fetchByProvince',
  async (provinceId: string, { getState }) => {
    const state = getState() as { branches: BranchesState };
    const lastFetched = state.branches.lastFetched[provinceId];

    // Return cached data if it's still valid
    if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return null; // Skip fetching if cache is valid
    }

    const branchesRef = collection(firestore, 'data/company/branches');
    const branchesQuery = query(
      branchesRef,
      where('status', '==', 'active'),
      where('provinceId', '==', provinceId),
      where('deleted', '!=', true)
    );

    const querySnapshot = await getDocs(branchesQuery);
    const branches: Branch[] = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        branchCode: doc.data().branchCode || '',
        name: doc.data().name || doc.data().branchName || '',
        nameEn: doc.data().nameEn || doc.data().branchNameEn || doc.data().name || doc.data().branchName || '',
        provinceId: doc.data().provinceId || '',
        address: {
          address: doc.data().address?.address || '',
          moo: doc.data().address?.moo,
          village: doc.data().address?.village,
          province: doc.data().address?.province || '',
          amphoe: doc.data().address?.amphoe || '',
          tambol: doc.data().address?.tambol || '',
          postcode: doc.data().address?.postcode || '',
          latitude: doc.data().address?.latitude,
          longitude: doc.data().address?.longitude
        },
        contact: {
          tel: doc.data().contact?.tel,
          fax: doc.data().contact?.fax,
          email: doc.data().contact?.email,
          website: doc.data().contact?.website
        },
        manager: doc.data().manager,
        created: doc.data().created || Date.now(),
        updated: doc.data().updated,
        inputBy: doc.data().inputBy || '',
        status: doc.data().status || 'active'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { provinceId, branches };
  }
);

const branchesSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    setBranchesForProvince: (state, action: PayloadAction<{ provinceId: string; branches: Branch[] }>) => {
      const { provinceId, branches } = action.payload;
      state.byProvince[provinceId] = branches;
    },
    setBranchesLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
      state.loading = action.payload.loading;
    },
    setBranchesError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBranchesByProvince.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchesByProvince.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Only update if we actually fetched new data
          const { provinceId, branches } = action.payload;
          state.byProvince[provinceId] = branches;
          state.lastFetched[provinceId] = Date.now();
        }
      })
      .addCase(fetchBranchesByProvince.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branches';
      });
  }
});

export const { setBranchesForProvince, setBranchesLoading, setBranchesError } = branchesSlice.actions;
export default branchesSlice.reducer;
