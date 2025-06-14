/**
 * 🔍 SYSTEM HEALTH VALIDATION UTILITY
 *
 * Comprehensive system validation for live deployment
 * Part of Live Deployment Control Panel
 */

import { app } from '../../firebase';

/**
 * Validate complete system health after deployment
 */
export const validateSystemHealth = async () => {
  const firestore = app.firestore();
  const results = {
    success: true,
    errors: [],
    warnings: [],
    validations: {},
  };

  try {
    console.log('🔍 Starting comprehensive system health validation...');

    // 1. Validate Firebase Connection
    console.log('📡 Validating Firebase connection...');
    try {
      await firestore.collection('users').limit(1).get();
      results.validations.firebaseConnection = {
        success: true,
        message: 'Firebase connection active',
      };
    } catch (error) {
      results.validations.firebaseConnection = {
        success: false,
        error: error.message,
      };
      results.errors.push('Firebase connection failed');
      results.success = false;
    }

    // 2. Validate User Authentication
    console.log('👤 Validating user authentication...');
    try {
      const currentUser = app.auth().currentUser;
      if (currentUser) {
        results.validations.userAuth = {
          success: true,
          message: `User authenticated: ${currentUser.email}`,
          userId: currentUser.uid,
        };
      } else {
        results.validations.userAuth = {
          success: false,
          error: 'No user authenticated',
        };
        results.errors.push('User authentication failed');
        results.success = false;
      }
    } catch (error) {
      results.validations.userAuth = { success: false, error: error.message };
      results.errors.push('User authentication validation failed');
      results.success = false;
    }

    // 3. Validate Province Data
    console.log('🏢 Validating province data...');
    try {
      const provincesSnapshot = await firestore
        .collection('data')
        .doc('company')
        .collection('provinces')
        .get();

      const provinces = provincesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const hasNakhonRatchasima = provinces.some(
        (p) => p.id === 'nakhon-ratchasima'
      );
      const hasNakhonSawan = provinces.some((p) => p.id === 'nakhon-sawan');

      if (hasNakhonRatchasima && hasNakhonSawan) {
        results.validations.provinceData = {
          success: true,
          message: `Found ${provinces.length} provinces including both required provinces`,
          provinces: provinces.map((p) => p.id),
        };
      } else {
        results.validations.provinceData = {
          success: false,
          error: `Missing required provinces. Found: ${provinces.map((p) => p.id).join(', ')}`,
        };
        results.errors.push('Province data incomplete');
        results.success = false;
      }
    } catch (error) {
      results.validations.provinceData = {
        success: false,
        error: error.message,
      };
      results.errors.push('Province data validation failed');
      results.success = false;
    }

    // 4. Validate Branch Data
    console.log('🏪 Validating branch data...');
    try {
      const branchesSnapshot = await firestore
        .collection('data')
        .doc('company')
        .collection('branches')
        .get();

      const branches = branchesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const requiredBranches = [
        '0450',
        'NMA002',
        'NMA003',
        'NSN001',
        'NSN002',
        'NSN003',
      ];
      const foundBranches = branches.map((b) => b.id);
      const missingBranches = requiredBranches.filter(
        (b) => !foundBranches.includes(b)
      );

      if (missingBranches.length === 0) {
        results.validations.branchData = {
          success: true,
          message: `Found all ${requiredBranches.length} required branches`,
          branches: foundBranches,
        };
      } else {
        results.validations.branchData = {
          success: false,
          error: `Missing branches: ${missingBranches.join(', ')}`,
        };
        results.errors.push('Branch data incomplete');
        results.success = false;
      }
    } catch (error) {
      results.validations.branchData = { success: false, error: error.message };
      results.errors.push('Branch data validation failed');
      results.success = false;
    }

    // 5. Validate ProvinceId Migration
    console.log('📋 Validating provinceId migration...');
    try {
      const testCollections = [
        'sections/account/incomes',
        'sections/sales/vehicles',
        'sections/sales/bookings',
      ];

      let totalChecked = 0;
      let documentsWithProvinceId = 0;
      let documentsWithoutProvinceId = 0;

      for (const collectionPath of testCollections) {
        try {
          const snapshot = await firestore
            .collection(collectionPath)
            .limit(10)
            .get();

          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalChecked++;
            if (data.provinceId) {
              documentsWithProvinceId++;
            } else {
              documentsWithoutProvinceId++;
            }
          });
        } catch (error) {
          console.warn(`Could not check ${collectionPath}: ${error.message}`);
        }
      }

      if (totalChecked === 0) {
        results.validations.provinceIdMigration = {
          success: true,
          message: 'No documents found to validate (empty collections)',
          warning: 'No data to validate migration',
        };
        results.warnings.push('No documents found for provinceId validation');
      } else if (documentsWithoutProvinceId === 0) {
        results.validations.provinceIdMigration = {
          success: true,
          message: `All ${documentsWithProvinceId} checked documents have provinceId`,
          totalChecked,
          withProvinceId: documentsWithProvinceId,
        };
      } else {
        results.validations.provinceIdMigration = {
          success: false,
          error: `${documentsWithoutProvinceId} documents missing provinceId out of ${totalChecked} checked`,
          totalChecked,
          withProvinceId: documentsWithProvinceId,
          withoutProvinceId: documentsWithoutProvinceId,
        };
        results.errors.push('ProvinceId migration incomplete');
        results.success = false;
      }
    } catch (error) {
      results.validations.provinceIdMigration = {
        success: false,
        error: error.message,
      };
      results.errors.push('ProvinceId migration validation failed');
      results.success = false;
    }

    // 6. Validate User RBAC Structure
    console.log('👥 Validating user RBAC structure...');
    try {
      const usersSnapshot = await firestore.collection('users').limit(10).get();

      if (usersSnapshot.empty) {
        results.validations.userRBAC = {
          success: false,
          error: 'No users found in system',
        };
        results.errors.push('No users found');
        results.success = false;
      } else {
        let usersWithRBAC = 0;
        let usersWithoutRBAC = 0;
        const userSamples = [];

        usersSnapshot.docs.forEach((doc) => {
          const userData = doc.data();
          const hasRBACStructure =
            userData.access &&
            userData.access.level &&
            userData.access.geographic;

          if (hasRBACStructure) {
            usersWithRBAC++;
          } else {
            usersWithoutRBAC++;
          }

          userSamples.push({
            id: doc.id,
            email: userData.email,
            hasRBAC: hasRBACStructure,
            accessLevel: userData.access?.level,
            provinces: userData.access?.geographic?.provinces,
          });
        });

        if (usersWithoutRBAC === 0) {
          results.validations.userRBAC = {
            success: true,
            message: `All ${usersWithRBAC} checked users have RBAC structure`,
            usersChecked: usersWithRBAC + usersWithoutRBAC,
            usersWithRBAC,
            samples: userSamples.slice(0, 3),
          };
        } else {
          results.validations.userRBAC = {
            success: false,
            error: `${usersWithoutRBAC} users missing RBAC structure out of ${usersWithRBAC + usersWithoutRBAC} checked`,
            usersChecked: usersWithRBAC + usersWithoutRBAC,
            usersWithRBAC,
            usersWithoutRBAC,
            samples: userSamples.slice(0, 3),
          };
          results.errors.push('User RBAC migration incomplete');
          results.success = false;
        }
      }
    } catch (error) {
      results.validations.userRBAC = { success: false, error: error.message };
      results.errors.push('User RBAC validation failed');
      results.success = false;
    }

    // 7. Validate System Performance
    console.log('⚡ Validating system performance...');
    try {
      const startTime = Date.now();

      // Test query performance
      await firestore.collection('users').limit(5).get();
      const queryTime = Date.now() - startTime;

      if (queryTime < 2000) {
        results.validations.performance = {
          success: true,
          message: `Query performance good: ${queryTime}ms`,
          queryTime,
        };
      } else {
        results.validations.performance = {
          success: false,
          error: `Query performance slow: ${queryTime}ms (expected < 2000ms)`,
          queryTime,
        };
        results.warnings.push('System performance may be degraded');
      }
    } catch (error) {
      results.validations.performance = {
        success: false,
        error: error.message,
      };
      results.warnings.push('Performance validation failed');
    }

    // 8. Validate Critical Collections Exist
    console.log('📚 Validating critical collections...');
    try {
      const criticalCollections = [
        'users',
        'data/company/provinces',
        'data/company/branches',
      ];

      const collectionResults = {};

      for (const collectionPath of criticalCollections) {
        try {
          const snapshot = await firestore
            .collection(collectionPath)
            .limit(1)
            .get();
          collectionResults[collectionPath] = {
            exists: true,
            hasDocuments: !snapshot.empty,
            documentCount: snapshot.size,
          };
        } catch (error) {
          collectionResults[collectionPath] = {
            exists: false,
            error: error.message,
          };
        }
      }

      const missingCollections = Object.entries(collectionResults)
        .filter(([path, result]) => !result.exists)
        .map(([path]) => path);

      if (missingCollections.length === 0) {
        results.validations.criticalCollections = {
          success: true,
          message: 'All critical collections exist',
          collections: collectionResults,
        };
      } else {
        results.validations.criticalCollections = {
          success: false,
          error: `Missing critical collections: ${missingCollections.join(', ')}`,
          collections: collectionResults,
        };
        results.errors.push('Critical collections missing');
        results.success = false;
      }
    } catch (error) {
      results.validations.criticalCollections = {
        success: false,
        error: error.message,
      };
      results.errors.push('Critical collections validation failed');
      results.success = false;
    }

    // Summary
    const totalValidations = Object.keys(results.validations).length;
    const successfulValidations = Object.values(results.validations).filter(
      (v) => v.success
    ).length;
    const failedValidations = totalValidations - successfulValidations;

    console.log(`✅ System health validation completed`);
    console.log(`   Total validations: ${totalValidations}`);
    console.log(`   Successful: ${successfulValidations}`);
    console.log(`   Failed: ${failedValidations}`);
    console.log(`   Warnings: ${results.warnings.length}`);

    results.summary = {
      totalValidations,
      successfulValidations,
      failedValidations,
      warningCount: results.warnings.length,
      overallSuccess: results.success,
    };

    return results;
  } catch (error) {
    console.error('❌ System health validation failed:', error);
    return {
      success: false,
      errors: [`System health validation failed: ${error.message}`],
      warnings: [],
      validations: {},
      summary: {
        totalValidations: 0,
        successfulValidations: 0,
        failedValidations: 1,
        warningCount: 0,
        overallSuccess: false,
      },
    };
  }
};
