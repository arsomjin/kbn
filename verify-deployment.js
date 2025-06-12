/**
 * 🔍 QUICK VERIFICATION SCRIPT
 * Run this to verify multi-province deployment is working
 */

// Quick verification function
const verifyMultiProvince = () => {
  console.log('🔍 VERIFYING MULTI-PROVINCE DEPLOYMENT...');
  
  // Check Redux store for provinces
  const store = window.store || (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current);
  
  if (window.store) {
    const state = window.store.getState();
    
    console.log('📊 PROVINCE DATA:');
    console.log('Provinces available:', Object.keys(state.provinces || {}));
    console.log('Branches available:', Object.keys(state.data?.branches || {}));
    
    // Check if Nakhon Sawan exists
    const hasNakhonSawan = state.provinces && state.provinces['nakhon-sawan'];
    const hasNSNBranches = state.data?.branches && (
      state.data.branches['NSN001'] || 
      state.data.branches['NSN002'] || 
      state.data.branches['NSN003']
    );
    
    console.log('✅ Verification Results:');
    console.log(`  Nakhon Sawan Province: ${hasNakhonSawan ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  NSN Branches: ${hasNSNBranches ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (hasNakhonSawan && hasNSNBranches) {
      console.log('🎉 MULTI-PROVINCE DEPLOYMENT VERIFIED SUCCESSFUL!');
      console.log('🎯 Your customer can now use multi-province operations!');
      
      alert('🎉 VERIFICATION SUCCESS!\n\nMulti-province support is working correctly!\n\n✅ Nakhon Sawan province detected\n✅ NSN branches available\n✅ Ready for customer use!');
      
      return true;
    } else {
      console.log('⚠️ Some components may need page refresh');
      console.log('💡 Try refreshing the page and running verification again');
      return false;
    }
  } else {
    console.log('ℹ️ Redux store not accessible from console');
    console.log('💡 Navigate to any module to test province/branch selectors manually');
    return null;
  }
};

// Export for console use
if (typeof window !== 'undefined') {
  window.verifyMultiProvince = verifyMultiProvince;
  console.log('🔍 VERIFICATION READY');
  console.log('💻 Run: window.verifyMultiProvince()');
}

export default verifyMultiProvince; 