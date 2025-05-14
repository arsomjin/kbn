import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {log, error} from "firebase-functions/logger";
// Using require instead of import for CloudTasksClient to avoid ESM issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {CloudTasksClient} = require("@google-cloud/tasks");
import _ from "lodash";
import {
  cleanValuesBeforeSave,
  deepEqual,
  formatAssessmentData,
  createProductKeywords,
  addSearchFields,
  partialText,
  arrayForEach,
  createVehicleNoKeyWords,
  createPeripheralNoKeyWords,
  removeAllNonAlphaNumericCharacters,
  getExtraSaleSnap,
  extractPeripheralNo,
  extractVehicleNo,
  extractPeripheralModel,
  getVehicleHeader,
  getModelFromName,
  getCollection,
  getDoc,
  createNewId,
  convertToArray,
  cleanIdentityArray,
  cleanIdentityNumber,
  checkIsVehicleFromName,
  createKeywords,
  createBillNoSKCKeywords,
  getDates,
  hasVehicleNo,
  hasPeripheralNo,
} from "./utils";

// Initialize Firebase Admin
admin.initializeApp();
const firestore = admin.firestore();
const messaging = admin.messaging();

// Define collection references
const importVehicleRef = firestore
  .collection("sections")
  .doc("stocks")
  .collection("importVehicles");
const vehicleStockRef = firestore
  .collection("sections")
  .doc("stocks")
  .collection("vehicles");
const importPartRef = firestore
  .collection("sections")
  .doc("stocks")
  .collection("importParts");
const deliverItemsRef = firestore
  .collection("sections")
  .doc("stocks")
  .collection("deliverItems");
const salesRef = firestore
  .collection("sections")
  .doc("sales")
  .collection("vehicles");
const bookingsRef = firestore
  .collection("sections")
  .doc("sales")
  .collection("bookings");

// Type definitions
interface Address {
  address: string | null;
  moo: string | null;
  village: string | null;
  tambol: string | null;
  amphoe: string | null;
  province: string | null;
  postcode: string | null;
}

interface SearchVehicleState {
  reserved: Record<string, unknown> | null;
  sold: Record<string, unknown> | null;
  baac: boolean | null;
  skl: boolean | null;
  kbnLeasing: boolean | null;
  transfer: Record<string, unknown> | null;
  turnOver: Record<string, unknown> | null;
  seize: Record<string, unknown> | null;
  auction: Record<string, unknown> | null;
  wreck: Record<string, unknown> | null;
  exported: Record<string, unknown> | null;
  decal: Record<string, unknown> | null;
  decalTaken: Record<string, unknown> | null;
}

interface MessageTokenCondition {
  group?: string;
  department?: string;
  branch?: string;
  provinceId?: string; // Added for multi-province support
}

interface NotificationPayload {
  data: {[key: string]: string}; // Changed from Record<string, unknown> to match Firebase API
  tokens: string[];
}

interface Transaction {
  ts: admin.firestore.Timestamp | null;
  by: string | null;
  type: string;
  info?: string;
  docId?: string;
  docNo?: string;
  docDate?: admin.firestore.Timestamp;
  customerId?: string;
  customer?: string;
  bookId?: string;
  bookNo?: string;
  fromOrigin?: string;
  toDestination?: string;
  exportDate?: admin.firestore.Timestamp;
  importDate?: admin.firestore.Timestamp;
  isDecal?: boolean;
  isTakeOut?: boolean;
  subType?: string;
  origin?: string;
}

interface VehicleStockItem {
  vehicleNo: string;
  vehicleNoFull: string;
  productCode: string;
  branchCode: string;
  productName: string;
  docNo: string;
  productType: string;
  isVehicle: boolean;
  isFIFO: boolean;
  isUsed: boolean;
  engineNo: string | null;
  vehicleNoLower: string;
  vehicleNoPartial: string[];
  keywords: string[];
  productPCode: string;
  peripheralNo: string;
  peripheralNoFull: string;
  model: string;
  peripheralNoLower: string;
  peripheralNoPartial: string[];
  transactions: Transaction[];
  [key: string]: unknown; // For dynamic properties
}

interface Reserved {
  bookId: string | null;
  bookNo: string | null;
  saleType: string | null;
  customerId: string | null;
  customer: string | null;
  ts: admin.firestore.Timestamp | null;
  by: string[] | null;
}

interface SoldInfo {
  deliverId: string | null;
  saleId: string | null;
  saleNo: string | null;
  saleType: string | null;
  customerId: string | null;
  customer: string | null;
  ts: admin.firestore.Timestamp | null;
  by: string[] | null;
}

interface TransferInfo {
  fromOrigin: string;
  toDestination: string;
  exportDate: admin.firestore.Timestamp | null;
  importDate: admin.firestore.Timestamp | null;
  docId: string | null;
  docNo: string | null;
}

interface ExportedInfo {
  exportId: string | null;
  docNo: string | null;
  ts: admin.firestore.Timestamp | null;
  by: string | null;
  destination: string | null;
}

interface Owner {
  customer: string;
  customerId: string;
  date: admin.firestore.Timestamp;
}

interface SaleVehicle {
  model: string;
  productName: string;
  date: admin.firestore.Timestamp;
  vehicleNo: string[];
  qty: number;
}

// Constants
const initAddress: Address = {
  address: null,
  moo: null,
  village: null,
  tambol: null,
  amphoe: null,
  province: null,
  postcode: null,
};

const searchVehicleObj: SearchVehicleState = {
  reserved: null,
  sold: null,
  baac: null,
  skl: null,
  kbnLeasing: null,
  transfer: null,
  turnOver: null,
  seize: null,
  auction: null,
  wreck: null,
  exported: null,
  decal: null,
  decalTaken: null,
};

/**
 * Transform the field names to follow camelCase naming convention
 * and provide compatibility with existing code
 */
interface SearchableFields {
  // Using camelCase for internal variables
  vehicleNoLower: string;
  vehicleNoPartial: string[];
  peripheralNoLower: string;
  peripheralNoPartial: string[];
  saleNoLower: string;
  saleNoPartial: string[];
  firstNameLower: string;
  firstNamePartial: string[];
  docNoLower: string;
}

// Utility function to check if only createdAt field changed
function onlyCreatedAtChanged(before: any, after: any): boolean {
  const beforeKeys = Object.keys(before || {});
  const afterKeys = Object.keys(after || {});
  const allKeys = new Set([...beforeKeys, ...afterKeys]);

  const changedKeys: string[] = [];

  allKeys.forEach((key) => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    const beforeStr = JSON.stringify(beforeVal);
    const afterStr = JSON.stringify(afterVal);
    if (beforeStr !== afterStr) {
      changedKeys.push(key);
    }
  });

  return changedKeys.length === 1 && changedKeys[0] === "createdAt";
}

async function getTokens(cond: MessageTokenCondition = {}): Promise<string[]> {
  const tokensRef = firestore.collection("messageTokens");
  const {group, department, branch, provinceId} = cond;
  let query: FirebaseFirestore.Query = tokensRef;
  
  if (group) {
    // Special handling for pending users - province admins should also receive these notifications
    if (group === "users" || group === "pending") {
      // For user-related notifications, include both the specified group and province_admin role
      const groupTokensPromise = tokensRef.where("group", "==", group).get();
      const adminTokensPromise = tokensRef.where("role", "==", "province_admin").get();
      
      if (provinceId) {
        // If province is specified, filter province admins by that province
        const [groupTokens, adminTokens] = await Promise.all([
          groupTokensPromise,
          tokensRef.where("role", "==", "province_admin").where("provinceId", "==", provinceId).get()
        ]);
        
        const tokens = new Set<string>();
        groupTokens.forEach(doc => tokens.add(doc.data().token));
        adminTokens.forEach(doc => tokens.add(doc.data().token));
        return Array.from(tokens);
      } else {
        // If no province specified, get all province admins
        const [groupTokens, adminTokens] = await Promise.all([groupTokensPromise, adminTokensPromise]);
        const tokens = new Set<string>();
        groupTokens.forEach(doc => tokens.add(doc.data().token));
        adminTokens.forEach(doc => tokens.add(doc.data().token));
        return Array.from(tokens);
      }
    } else {
      // Standard group filtering
      query = query.where("group", "==", group);
    }
  }
  
  if (department) {
    query = query.where("department", "==", department);
  }
  if (branch) {
    query = query.where("branch", "==", branch);
  }
  if (provinceId) {
    query = query.where("provinceId", "==", provinceId);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data().token);
}

const sendNotification = async (payload: NotificationPayload): Promise<{successes: number, failures: number} | null> => {
  const response = await messaging.sendEachForMulticast(payload);
  if (response) {
    const successes = response.responses.filter(
      (r) => r.success === true
    ).length;
    const failures = response.responses.filter(
      (r) => r.success === false
    ).length;

    // Clean up invalid tokens across all users
    await Promise.all(
      response.responses.map(async (res, idx) => {
        if (
          !res.success &&
          res.error &&
          [
            "messaging/invalid-registration-token",
            "messaging/registration-token-not-registered",
          ].includes(res.error.code)
        ) {
          const invalidToken = payload.tokens[idx];
          const snapshot = await firestore
            .collection("messageTokens")
            .where("token", "==", invalidToken)
            .get();
          snapshot.forEach((doc) => doc.ref.delete());
        }
      })
    );

    return {successes, failures};
  }
  return null;
};

exports.notifyUsers = functions.region("asia-northeast1").firestore.document("/messages/{messageId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const newMessage = snap.data() || {};
      const {branch, department, group} = newMessage;
      const messageId = context.params.messageId;
      const data = {...newMessage, messageId};
      log({data, messageId});
      const tokens = await getTokens({branch, department, group});
      const payload = {
        data,
        tokens,
      };
      const notify = await sendNotification(payload);
      if (notify) {
        const {successes, failures} = notify;
        log("Notifications sent:", `${successes} successful, ${failures} failed`);
      }
    } catch (e) {
      log(e);
    }
  });

/**
 * Scheduled Firestore backup using FirestoreAdminClient
 * Exports all collections to the configured GCS bucket every 24 hours.
 */
exports.scheduledFirestoreBackup = functions.region("asia-northeast1").pubsub.schedule("every 24 hours")
  .onRun(async (): Promise<null> => {
    // Use FirestoreAdminClient for export
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {FirestoreAdminClient} = require("@google-cloud/firestore").v1;
    const client = new FirestoreAdminClient();
    const BUCKET = "gs://kubota-benjapol-backup-bucket";
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, "(default)");
    try {
      const [response] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: BUCKET,
        collectionIds: [], // Export all collections
      });
      log(`DAILY FIRESTORE BACKUP: ${response.name}`);
      return null;
    } catch (err) {
      console.error(err);
      throw new Error(`FIRESTORE BACKUP FAILED: ${JSON.stringify(err)}`);
    }
  });

exports.updateWhenNewVehicleProductAdd = functions.region("asia-northeast1").firestore.document("/data/products/vehicleList/{vehicleId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const vehicleId = context.params.vehicleId;
    try {
      const values = snap.data() || {};
      const newValues = Object.assign(
        {},
        addSearchFields(values, ["name", "productCode", "productType"])
      );
      const header = getVehicleHeader(newValues.name as string);
      const model = getModelFromName(newValues.name as string);
      newValues.deleted = false;
      newValues.header = header;
      newValues.model = model;
      newValues.keywords = createProductKeywords(newValues);
      newValues.isUsed = (newValues.productCode as string).startsWith("2-");
      newValues.productPCode = removeAllNonAlphaNumericCharacters(
        newValues.productCode as string
      );
      const updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("vehicleList")
        .doc(vehicleId);
      await updateRef.set(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateVehicleProductList = functions.region("asia-northeast1").firestore.document("/data/products/vehicleList/{vehicleId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const vehicleId = context.params.vehicleId;
      const values = after;
      const newValues = Object.assign(
        {},
        addSearchFields(values, ["name", "productCode", "productType"])
      );
      const header = getVehicleHeader(newValues.name as string);
      const model = getModelFromName(newValues.name as string);
      newValues.header = header;
      newValues.model = model;
      newValues.keywords = createProductKeywords(newValues);
      newValues.isUsed = (newValues.productCode as string).startsWith("2-");
      newValues.productPCode = removeAllNonAlphaNumericCharacters(
        newValues.productCode as string
      );

      const updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("vehicleList")
        .doc(vehicleId);
      await updateRef.update(newValues);
      return null;
    } catch (e) {
      log(e);
      return null;
    }
  });

exports.updateWhenNewPartProductAdd = functions.region("asia-northeast1").firestore.document("/data/products/partList/{partId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const partId = context.params.partId;
    try {
      const values = snap.data() || {};
      const newValues = addSearchFields(values, ["name", "pCode", "model"]);
      const updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("partList")
        .doc(partId);
      await updateRef.set(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updatePartProductList = functions.region("asia-northeast1").firestore.document("/data/products/partList/{partId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const partId = context.params.partId;

      const values = after;
      const newValues = addSearchFields(values, ["name", "pCode", "model"]);

      const updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("partList")
        .doc(partId);
      await updateRef.update(newValues);
      return null;
    } catch (e) {
      log(e);
      return null;
    }
  });

exports.updateWhenNewServiceAdd = functions.region("asia-northeast1").firestore.document("/data/services/serviceList/{serviceId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const serviceId = context.params.serviceId;
    try {
      const values = snap.data() || {};
      const newValues = addSearchFields(values, ["name", "serviceCode"]);
      const updateRef = firestore
        .collection("data")
        .doc("services")
        .collection("serviceList")
        .doc(serviceId);
      await updateRef.set(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateServiceList = functions.region("asia-northeast1").firestore.document("/data/services/serviceList/{serviceId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const serviceId = context.params.serviceId;

      const values = after;
      const newValues = addSearchFields(values, ["name", "serviceCode"]);

      const updateRef = firestore
        .collection("data")
        .doc("services")
        .collection("serviceList")
        .doc(serviceId);
      await updateRef.update(newValues);
      return null;
    } catch (e) {
      log(e);
      return null;
    }
  });

exports.updateVehicleImport = functions.region("asia-northeast1").firestore.document("/sections/stocks/importVehicles/{vehicleId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const {
        productCode,
        productName,
        branchCode,
        vehicleNo,
        peripheralNo,
        engineNo,
        docNo,
        docDate,
        billNoSKC,
        importTime,
        importBy,
        batchNo,
        storeLocationCode,
        import: qty,
      } = snap.data() || {};

      const keywords = createBillNoSKCKeywords(billNoSKC);
      await importVehicleRef.doc(context.params.vehicleId).update({keywords});

      const vehicleArr = convertToArray(vehicleNo);
      const peripheralArr = convertToArray(peripheralNo);
      const engineArr = convertToArray(engineNo);

      const isVehicle = storeLocationCode ?
        storeLocationCode.startsWith("NV") :
        checkIsVehicleFromName(productName);

      const vehicleStock: any[] = [];

      for (let i = 0; i < qty; i++) {
        const vNo = vehicleArr[i];
        let str = "";
        let vNoShort = "";
        const pNo = peripheralArr[i];
        let str2 = "";
        let pNoShort = "";
        if (!!vNo && ["number", "string"].includes(typeof vNo)) {
          str = cleanIdentityNumber(vNo);
          vNoShort = extractVehicleNo(str);
        }
        if (!!pNo && ["number", "string"].includes(typeof pNo)) {
          str2 = cleanIdentityNumber(pNo);
          pNoShort = extractPeripheralNo(str2);
        }

        let model = isVehicle ?
          getModelFromName(productName) :
          extractPeripheralModel(str2);
        if (model.length < 3) {
          model = getModelFromName(productName);
        }

        vehicleStock.push({
          vehicleNo: vNoShort,
          vehicleNoFull: str,
          productCode,
          branchCode,
          productName,
          docNo,
          productType: isVehicle ? "รถใหม่" : "อุปกรณ์ใหม่",
          isVehicle,
          isFIFO: !vNoShort && !pNoShort,
          isUsed: productCode.substring(0, 2) === "2-",
          engineNo:
            engineArr.length > 0 && !!engineArr[i] ? engineArr[i] : null,
          vehicleNoLower: vNoShort.toLowerCase(),
          vehicleNoPartial: partialText(vNoShort),
          keywords: isVehicle ?
            createVehicleNoKeyWords(vNoShort) :
            createPeripheralNoKeyWords(pNoShort),
          productPCode: removeAllNonAlphaNumericCharacters(productCode),
          peripheralNo: pNoShort,
          peripheralNoFull: str2,
          model,
          peripheralNoLower: pNoShort.toLowerCase(),
          peripheralNoPartial: partialText(pNoShort),
          transactions: [
            {
              ts: importTime,
              by: importBy,
              type: "import",
              ...(batchNo && {info: `BatchNo: ${batchNo}`}),
              docNo,
              docDate,
              billNoSKC,
            },
          ],
          ...searchVehicleObj,
        });
      }

      // Add inventory
      await arrayForEach(vehicleStock, async (vItem, i) => {
        let vId = isVehicle ? vItem.vehicleNoFull : vItem.peripheralNoFull;
        if (vId.length < 8) {
          vId = createNewId("KVEH");
          vId = `${vId.slice(0, -1)}${i}`;
        }
        await vehicleStockRef.doc(vId).set(vItem);
      });
    } catch (e) {
      log(e);
    }
  });

exports.updateVehicleUnitPrice = functions.region("asia-northeast1").firestore.document("/sections/stocks/importVehicles/{vehicleId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const before = change.before.data() || {};
      if (!before.unitPrice && after.unitPrice) {
        const peripheralArr = convertToArray(after.peripheralNo);
        const vehicleArr = convertToArray(after.vehicleNo);
        const isVehicle = after.storeLocationCode ?
          after.storeLocationCode.startsWith("NV") :
          checkIsVehicleFromName(after.productName);
        const wheres: [string, any, any][] = isVehicle ?
          [["vehicleNoFull", "in", vehicleArr]] :
          [["peripheralNoFull", "in", peripheralArr]];
        const vSnap = await getCollection(
          firestore,
          "sections/stocks/vehicles",
          wheres
        );
        if (vSnap) {
          const items: any[] = [];
          vSnap.forEach((doc) => {
            items.push({...doc.data(), _key: doc.id});
          });
          items.length > 0 &&
            (await vehicleStockRef.doc(items[0]._key).update({
              unitPrice: after.unitPrice,
              discount: after.discount,
            }));
        }
      }
      return null;
    } catch (e) {
      log(e);
      return null;
    }
  });

exports.recheckImportKeywords = functions.region("asia-northeast1").https.onRequest(async (req: functions.https.Request, res: functions.Response) => {
  const payload = req.body;
  try {
    log("CLOUD_TASK_TRIGGED", payload);
    const {dataType, batchNo} = payload;
    if (!!dataType && !!batchNo) {
      let path = "sections/stocks/importVehicles";
      switch (dataType) {
      case "vehicles":
        path = "sections/stocks/importVehicles";
        break;
      case "parts":
        path = "sections/stocks/importParts";
        break;
      default:
        break;
      }
      const wheres: [string, any, any][] = [["batchNo", "==", batchNo]];
      const vSnap = await getCollection(firestore, path, wheres);
      if (vSnap) {
        const items: any[] = [];
        vSnap.forEach((doc) => {
          items.push({...doc.data(), _key: doc.id});
        });
        const noKeywords = items.filter((l: any) => !l.keywords);
        if (noKeywords.length > 0) {
          await arrayForEach(noKeywords, async (it: any) => {
            if (it.billNoSKC) {
              const keywords = createBillNoSKCKeywords(it.billNoSKC);
              if (dataType === "parts") {
                await importPartRef.doc(it._key).update({keywords});
              } else if (dataType === "vehicles") {
                await importVehicleRef.doc(it._key).update({keywords});
              }
              log("RECHECK_UPDATED", batchNo);
            }
          });
        } else {
          log("KEYWORDS_COMPLETED", batchNo);
        }
      }
    }
    res.send(200);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
    return;
  }
});

exports.afterImportTrigger = functions.region("asia-northeast1").firestore.document("/sections/stocks/importLog/{docId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const {ts, dataType, batchNo} = snap.data() || {};
      const project = "kubota-benjapol";
      const location = "us-central1"; // asia-northeast1 not working.
      const queue = "KUBOTA-QUEUE";
      const tasksClient = new CloudTasksClient();
      const queuePath = tasksClient.queuePath(project, location, queue);
      const url = `https://${location}-${project}.cloudfunctions.net/recheckImportKeywords`;
      const payload = {ts, dataType, batchNo};
      const task = {
        httpRequest: {
          httpMethod: "POST" as const,
          url,
          body: Buffer.from(JSON.stringify(payload)).toString("base64"),
          headers: {
            "Content-Type": "application/json",
          },
        },
        scheduleTime: {
          seconds: 300 + Date.now() / 1000,
        },
      };
      const [response] = await tasksClient.createTask({
        parent: queuePath,
        task,
      });
      log("AFTER_IMPORT_TRIGGED", {
        name: response.name,
      });
    } catch (e) {
      error(e);
    }
  });

exports.updatePartImport = functions.region("asia-northeast1").firestore.document("/sections/stocks/importParts/{partId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const {billNoSKC} = snap.data() || {};
      const partId = context.params.partId;
      if (!!billNoSKC && !!partId) {
        const keywords = createBillNoSKCKeywords(billNoSKC);
        log({billNoSKC, partId, keywords});
        await importPartRef.doc(partId).update({keywords});
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateNewCustomer = functions.region("asia-northeast1").firestore.document("/data/sales/customers/{customerId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const customerId = context.params.customerId;
    try {
      const values = snap.data() || {};
      const newValues = addSearchFields(values, [
        "firstName",
        "lastName",
        "phoneNumber",
        "customerNo",
        "customerId",
      ]);
      const updateRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers")
        .doc(customerId);
      await updateRef.set(newValues);
    } catch (e) {
      error(e);
    }
  });

exports.onUpdateSaleVehicles = functions.region("asia-northeast1").firestore.document("/sections/sales/vehicles/{saleId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const {
        bookNo,
        creditRecorded,
        creditInfo,
        saleCutoffDate,
        referringDetails,
      } = after;
      // Update booking data.
      if (bookNo && !!saleCutoffDate && !change.before.data()?.saleCutoffDate) {
        const bSnap = await getCollection(firestore, "sections/sales/bookings", [
          ["bookPNo", "==", removeAllNonAlphaNumericCharacters(bookNo)],
        ]);
        if (bSnap) {
          let bItem: any = {};
          bSnap.forEach((doc) => {
            bItem = {...doc.data(), _id: doc.id};
          });
          !!bItem?._id &&
            (await bookingsRef.doc(bItem._id).update({
              ...(!!creditRecorded && {creditRecorded}),
              ...(!!creditInfo && {creditInfo}),
              ...(!!saleCutoffDate && {saleCutoffDate}),
              ...(!!referringDetails && {referringDetails}),
            }));
        }
      }
      return null;
    } catch (e) {
      error(e);
      return null;
    }
  });

exports.updateReportSaleVehicles = functions.region("asia-northeast1").firestore.document("/sections/sales/vehicles/{saleId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("vehicles");
      const mktChannelsRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("mktChannels");
      const customerRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");
      const {
        date,
        saleId,
        saleNo,
        saleNoLower,
        saleNoPartial,
        branchCode,
        customerId,
        prefix,
        firstName,
        firstNameLower,
        firstNamePartial,
        lastName,
        phoneNumber,
        items,
        saleType,
        salesPerson,
        sourceOfData,
        address,
        bookNo,
        referrer,
      } = snap.data() || {};
      const extraSnap = items ? getExtraSaleSnap(items) : {};
      let mAddress = address || initAddress;
      if (!address?.amphoe && !!customerId) {
        const cusDoc = await customerRef.doc(customerId).get();
        if (cusDoc) {
          mAddress = cusDoc.data()?.address || initAddress;
        }
      }
      const {village, tambol, amphoe, province, postcode} = mAddress;
      const extraSnap2 = {
        customer: `${prefix}${firstName} ${lastName || ""}`.trim(),
        village: village || null,
        tambol: tambol || null,
        amphoe: amphoe || null,
        province: province || null,
        postcode: postcode || null,
      };

      log("report_snap", {
        ...snap.data(),
        ...extraSnap,
        ...extraSnap2,
      });
      await reportRef
        .doc(context.params.saleId)
        .set({...snap.data(), ...extraSnap, ...extraSnap2});
      await mktChannelsRef.doc(context.params.saleId).set({
        date,
        saleId,
        saleNo,
        saleNoLower,
        saleNoPartial,
        branchCode,
        customerId,
        prefix,
        firstName,
        firstNameLower,
        firstNamePartial,
        lastName,
        phoneNumber,
        items,
        saleType,
        salesPerson,
        sourceOfData,
        ...extraSnap,
        ...extraSnap2,
      });
      // Update booking data.
      if (bookNo) {
        const bSnap = await getCollection(firestore, "sections/sales/bookings", [
          ["bookPNo", "==", removeAllNonAlphaNumericCharacters(bookNo)],
        ]);
        if (bSnap) {
          let bItem: any = {};
          bSnap.forEach((doc) => {
            bItem = {...doc.data(), _id: doc.id};
          });
          !!bItem?._id &&
            (await bookingsRef.doc(bItem._id).update({
              sold: {
                saleId,
                saleNo,
                soldDate: date,
                saleType,
              },
            }));
        }
      }
      if (!!referrer && !!referrer?.firstName && !!saleId) {
        // Update referrerName
        const referrerName = `${referrer?.prefix || ""}${
          referrer?.firstName || ""
        } ${referrer?.lastName || ""}`.trim();
        await salesRef.doc(saleId).update({
          referrerName,
        });
      } else {
        await salesRef.doc(saleId).update({
          referrerName: "",
        });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateReportSaleParts = functions.region("asia-northeast1").firestore.document("/sections/sales/partGroups/{saleId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("parts");
      await reportRef.doc(context.params.saleId).set(snap.data() || {});
    } catch (e) {
      error(e);
    }
  });

exports.updateReportService = functions.region("asia-northeast1").firestore.document("/sections/services/importServices/{serviceId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const reportRef = firestore
        .collection("reports")
        .doc("services")
        .collection("all");
      await reportRef.doc(context.params.serviceId).set(snap.data() || {});
    } catch (e) {
      error(e);
    }
  });

exports.updateBookingOrder = functions.region("asia-northeast1").firestore.document("/sections/sales/bookings/{bookId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("assessment");

      const order = snap.data() || {};
      const newValues = formatAssessmentData(order);
      const doc = cleanValuesBeforeSave(newValues);

      // createReportSaleAssessment
      await reportRef.doc(context.params.bookId).set(doc);

      if (!!order?.items && order.items.length > 0) {
        // Update stock.
        const reserved = {
          bookId: order.bookId || null,
          bookNo: order.bookNo || null,
          saleType: order.saleType || null,
          customerId: order.customerId || null,
          customer: order.customer || null,
          ts: order.created || null,
          by: order.salesPerson || [],
        };

        const transaction = [
          {
            ts: order.created || null,
            by: order.salesPerson || null,
            type: "reserve",
            info: `ใบจองเลขที่: ${order.bookNo} ลูกค้า: ${order.customer}`,
            docId: order?.bookId || null,
            customerId: order.customerId || null,
            customer: order.customer || null,
            bookId: order.bookId || null,
            bookNo: order.bookNo || null,
          },
        ];

        await arrayForEach(order.items as any[], async (item: any) => {
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            const vNoArr = convertToArray(item.vehicleNo);
            if (vNoArr.length > 0) {
              let vSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["vehicleNo", "in", vNoArr]]
              );
              if (!vSnap) {
                // In case user enter full number.
                vSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["vehicleNoFull", "in", vNoArr]]
                );
              }
              if (vSnap) {
                let vItem: any = {};
                vSnap.forEach((doc) => {
                  vItem = {...doc.data(), _id: doc.id};
                });
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).update({
                    reserved,
                    transactions: vItem?.transactions ?
                      vItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            const pNoArr = Array.isArray(item.peripheralNo) ?
              item.peripheralNo :
              item.peripheralNo.split(",");
            if (pNoArr.length > 0) {
              let pSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["peripheralNo", "in", pNoArr]]
              );
              if (!pSnap) {
                // In case user enter full number.
                pSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["peripheralNoFull", "in", pNoArr]]
                );
              }
              if (pSnap) {
                let pItem: any = {};
                pSnap.forEach((doc) => {
                  pItem = {...doc.data(), _id: doc.id};
                });
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).update({
                    reserved,
                    transactions: pItem?.transactions ?
                      pItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else {
            // Check FIFO
            const fSnap = await getCollection(
              firestore,
              "sections/stocks/vehicles",
              [
                [
                  "productPCode",
                  "==",
                  removeAllNonAlphaNumericCharacters(item.productCode),
                ],
                ["isFIFO", "==", true],
                ["reserved", "==", null],
              ]
            );
            if (fSnap) {
              const fItems: any[] = [];
              fSnap.forEach((doc) => {
                if (!doc.data()?.exported) {
                  fItems.push({...doc.data(), _id: doc.id});
                }
              });
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).update({
                  reserved,
                  transactions: fItems[0]?.transactions ?
                    fItems[0].transactions.concat(transaction) :
                    transaction,
                }));
            }
          }
          return item;
        });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateBookingOrderChange = functions.region("asia-northeast1").firestore.document("/sections/sales/bookings/{bookId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const before = change.before.data() || {};
      const reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("assessment");
      const prev = before?.assessment || {};
      const cur = after?.assessment || {};
      const prevCustomerId = before?.customerId;
      const curCustomerId = after?.customerId;
      if (!deepEqual(prev, cur) || curCustomerId != prevCustomerId) {
        let newValues = formatAssessmentData(after);
        newValues = cleanValuesBeforeSave(newValues);
        log({prev, cur, newValues});
        await reportRef.doc(context.params.bookId).set(newValues);
      }
      return null;
    } catch (e) {
      error(e);
      return null;
    }
  });

exports.updateTransfer = functions.region("asia-northeast1").firestore.document("/sections/stocks/transfer/{transferId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    // Check stock existing, update product transfer data.
    try {
      const updateItemsRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("transferItems");
      const transferRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("transfer");

      const order = snap.data() || {};

      const docNoLower = order.docNo.toLowerCase();
      const key1 = createKeywords(docNoLower);
      const key2 = createKeywords(
        removeAllNonAlphaNumericCharacters(docNoLower)
      );
      const keywords = _.uniq([...key1, ...key2]);
      const transferId = context.params.transferId;
      await transferRef.doc(transferId).update({
        keywords,
      });

      if (order.items) {
        await arrayForEach(order.items as any[], async (item: any) => {
          const vNoArr = convertToArray(item.vehicleNo);
          const isVehicle = item?.productName ?
            checkIsVehicleFromName(item.productName) :
            vNoArr.length > 0;
          let model = isVehicle ?
            getModelFromName(item.productName) :
            extractPeripheralModel(item.peripheralNo);
          if (model.length < 3) {
            model = getModelFromName(item.productName);
          }
          // Add detail to item.
          await updateItemsRef.doc(item.transferItemId).set({
            ...item,
            exportDate: order.exportDate,
            docNo: order.docNo,
            docNoLower,
            transferId: order.transferId,
            toDestination: order.toDestination,
            fromOrigin: order.branchCode,
            importDate: order.importDate,
            deleted: order.deleted,
            exportVerifiedBy: order.exportVerifiedBy,
            exportRecordedBy: order.exportRecordedBy,
            receivedBy: order.receivedBy,
            deliveredBy: order.deliveredBy,
            model,
          });

          // Update transaction (transfer !== null -> item is in transfering process).
          const transfer = {
            fromOrigin: order.fromOrigin,
            toDestination: order.toDestination,
            exportDate: order.exportDate || null,
            importDate: order.importDate || null,
            docId: order?.transferId || null,
            docNo: order?.docNo || null,
          };

          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            const vNoArr = convertToArray(item.vehicleNo);
            if (vNoArr.length > 0) {
              let vSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["vehicleNo", "in", vNoArr]]
              );
              if (!vSnap) {
                // In case user enter full number.
                vSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["vehicleNoFull", "in", vNoArr]]
                );
              }
              if (vSnap) {
                // Vehicle found.
                let vItem: any = {};
                vSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === order.fromOrigin &&
                    !doc.data().transfer
                  ) {
                    // Vehicle is in stocks.
                    vItem = {...doc.data(), _id: doc.id};
                  }
                });
                // Update vehicle transfer data.
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).update({
                    transfer,
                  }));
              }
            }
          } else if (hasPNo) {
            const pNoArr = convertToArray(item.peripheralNo);
            if (pNoArr.length > 0) {
              let pSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["peripheralNo", "in", pNoArr]]
              );
              if (!pSnap) {
                // In case user enter full number.
                pSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["peripheralNoFull", "in", pNoArr]]
                );
              }
              if (pSnap) {
                // Peripheral found.
                let pItem: any = {};
                pSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === order.fromOrigin &&
                    !doc.data().transfer
                  ) {
                    // Peripheral is in stocks.
                    pItem = {...doc.data(), _id: doc.id};
                  }
                });
                // Update peripheral transfer data.
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).update({
                    transfer,
                  }));
              }
            }
          } else {
            // If item has no vehicle number and peripheral number, Check FIFO (First-in -> First-out)
            const fSnap = await getCollection(
              firestore,
              "sections/stocks/vehicles",
              [
                [
                  "productPCode",
                  "==",
                  removeAllNonAlphaNumericCharacters(item.productCode),
                ],
                ["isFIFO", "==", true],
                ["transfer", "==", null],
              ]
            );
            if (fSnap) {
              // Product found.
              const fItems: any[] = [];
              fSnap.forEach((doc) => {
                if (
                  !!doc.data()?.branchCode &&
                  doc.data().branchCode === order.fromOrigin &&
                  !doc.data().transfer
                ) {
                  // Product is in stocks.
                  fItems.push({...doc.data(), _id: doc.id});
                }
              });
              // Update product transfer data.
              fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).update({
                  transfer,
                }));
            }
          }
        });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateTransferChange = functions.region("asia-northeast1").firestore.document("/sections/stocks/transfer/{transferId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const before = change.before.data() || {};
      const updateItemsRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("transferItems");

      if (!before.deleted && after.deleted) {
        // Transfer document is deleted.
        if (after.items) {
          let mItems = after.items;
          // Update deleted to items.
          mItems = mItems.map((l: any) => ({...l, deleted: after.deleted}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await updateItemsRef.doc(item.transferItemId).update({
              deleted: after.deleted,
            });
          });
        }
      }
      if (!before.cancelled && after.cancelled) {
        // Trasfer document is cancelled.
        if (after.items) {
          let mItems = after.items;
          // Update cancelled to item.
          mItems = mItems.map((l: any) => ({...l, cancelled: after.cancelled}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await updateItemsRef.doc(item.transferItemId).update({
              cancelled: after.cancelled,
            });
          });
        }
      }
      if (!before.rejected && after.rejected) {
        // Transfer document is rejected.
        if (after.items) {
          let mItems = after.items;
          // Update rejected to item.
          mItems = mItems.map((l: any) => ({...l, rejected: after.rejected}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await updateItemsRef.doc(item.transferItemId).update({
              rejected: after.rejected,
            });
          });
        }
      }
      if (!before.completed && after.completed) {
        // Trasfer is completed.
        // Update stock item's branch.
        const mItems = after.items;
        const transaction = [
          {
            ts: after.completed.time,
            by: after.importRecordedBy,
            type: "transfer",
            fromOrigin: after.fromOrigin,
            toDestination: after.toDestination,
            exportDate: after.exportDate,
            importDate: after.importDate,
            docId: after?.transferId || null,
            docNo: after?.docNo || null,
          },
        ];
        await arrayForEach(mItems as any[], async (item: any) => {
          log("item", JSON.stringify(item));
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            const vNoArr = convertToArray(item.vehicleNo);
            if (vNoArr.length > 0) {
              let vSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["vehicleNo", "in", vNoArr]]
              );
              if (!vSnap) {
                // In case user enter full number.
                vSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["vehicleNoFull", "in", vNoArr]]
                );
              }
              if (vSnap) {
                // Vehicle stock is found.
                let vItem: any = {};
                vSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === after.fromOrigin
                  ) {
                    // Vehicle is in stocks.
                    vItem = {...doc.data(), _id: doc.id};
                  }
                });
                // Update new branch, transactions history, and clear stock transfer data.
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).update({
                    transfer: null,
                    branchCode: after.toDestination,
                    transactions: vItem?.transactions ?
                      vItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            log("peripheralNo", item?.peripheralNo);
            const pNoArr = convertToArray(item.peripheralNo);
            if (pNoArr.length > 0) {
              let pSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["peripheralNo", "in", pNoArr]]
              );
              if (!pSnap) {
                // In case user enter full number.
                pSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["peripheralNoFull", "in", pNoArr]]
                );
              }
              if (pSnap) {
                // Peripheral stock is found.
                let pItem: any = {};
                pSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === after.fromOrigin
                  ) {
                    // Peripheral is in stocks.
                    pItem = {...doc.data(), _id: doc.id};
                  }
                });
                log("*** Peripheral stock found ***", pItem);
                // Update new branch, transactions history, and clear stock transfer data.
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).update({
                    transfer: null,
                    branchCode: after.toDestination,
                    transactions: pItem?.transactions ?
                      pItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else {
            // If the product has no vehicle number and peripheral number, Check FIFO
            const fSnap = await getCollection(
              firestore,
              "sections/stocks/vehicles",
              [
                [
                  "productPCode",
                  "==",
                  removeAllNonAlphaNumericCharacters(item.productCode),
                ],
                ["isFIFO", "==", true],
                ["transfer", "!=", null],
              ]
            );
            if (fSnap) {
              // Product is found.
              const fItems: any[] = [];
              fSnap.forEach((doc) => {
                if (
                  !!doc.data()?.branchCode &&
                  doc.data().branchCode === after.fromOrigin
                ) {
                  // Product is in stocks.
                  fItems.push({...doc.data(), _id: doc.id});
                }
              });
              // Update new branch, transactions history, and clear stock transfer data.
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).update({
                  transfer: null,
                  branchCode: after.toDestination,
                  transactions: fItems[0]?.transactions ?
                    fItems[0].transactions.concat(transaction) :
                    transaction,
                }));
            }
          }
          // Set flag: 'completed' to transfer document.
          await updateItemsRef.doc(item.transferItemId).update({
            completed: after.completed,
          });
          return item;
        });
      }
      return null;
    } catch (e) {
      error(e);
      return null;
    }
  });

exports.updateSaleOut = functions.region("asia-northeast1").firestore.document("/sections/stocks/saleOut/{deliverId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const customersRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");

      const order = snap.data() || {};
      if (!!order.receivedBy && !!order.receivedDate && !!order.items) {
        if (order.saleId) {
          // Update inventory recorded on sale.
          const sSnap = await getCollection(
            firestore,
            "sections/sales/vehicles",
            [["saleId", "==", order.saleId]]
          );
          if (sSnap) {
            await salesRef.doc(order.saleId).update({
              ivAdjusted: {
                ts: order.created || null,
                by: order.recordedBy || null,
              },
            });
          }
        }
        const saleType = order.saleType || null;
        if (order.items) {
          const cDoc = await getDoc(
            firestore,
            "data",
            `sales/customers/${order.customerId}`
          );
          if (cDoc) {
            const customer = cDoc.data();
            // Update stock item's sold out.
            const transaction = [
              {
                ts: order.created || null,
                by: order.recordedBy || null,
                type: "saleOut",
                info: `ใบขายเลขที่: ${order.saleNo} ลูกค้า: ${order.customer}`,
                docId: order?.deliverId || null,
                customerId: order.customerId || null,
                customer: order.customer || null,
                saleId: order.saleId || null,
                saleNo: order.saleNo || null,
              },
            ];
            const sold = {
              deliverId: order?.deliverId || null,
              saleId: order.saleId || null,
              saleNo: order.saleNo || null,
              saleType: order.saleType || null,
              customerId: order.customerId || null,
              customer: order.customer || null,
              ts: order.created || null,
              by: order.salesPerson || [],
            };
            const owner = [
              {
                customer: order.customer,
                customerId: order.customerId,
                date: order.date,
              },
            ];
            await arrayForEach(order.items as any[], async (item: any) => {
              const saleVehicle: any[] = [
                {
                  model: getModelFromName(item.productName),
                  productName: item.productName,
                  date: order.date,
                  vehicleNo: [],
                  qty: item.qty,
                },
              ];
              const hasVNo = hasVehicleNo(item);
              const hasPNo = hasPeripheralNo(item);
              if (hasVNo) {
                const vNoArr = convertToArray(item.vehicleNo);
                saleVehicle[0].vehicleNo = vNoArr;
                if (vNoArr.length > 0) {
                  let vSnap = await getCollection(
                    firestore,
                    "sections/stocks/vehicles",
                    [["vehicleNo", "in", vNoArr]]
                  );
                  if (!vSnap) {
                    // In case user enter full number.
                    vSnap = await getCollection(
                      firestore,
                      "sections/stocks/vehicles",
                      [["vehicleNoFull", "in", vNoArr]]
                    );
                  }
                  if (vSnap) {
                    let vItem: any = {};
                    vSnap.forEach((doc) => {
                      if (!doc.data()?.sold) {
                        vItem = {...doc.data(), _id: doc.id};
                      }
                    });
                    !!vItem?._id &&
                      (await vehicleStockRef.doc(vItem._id).update({
                        sold,
                        baac: saleType === "baac" || null,
                        skl: saleType === "sklLeasing" || null,
                        kbnLeasing: saleType === "kbnLeasing" || null,
                        transactions: vItem?.transactions ?
                          vItem.transactions.concat(transaction) :
                          transaction,
                        owner: vItem?.owner ? vItem.owner.concat(owner) : owner,
                      }));
                    // Update customer ownership.
                    if (customer) {
                      !!order?.customerId &&
                        (await customersRef.doc(order.customerId).update({
                          vehicles: customer?.vehicles ?
                            customer.vehicles.concat(saleVehicle) :
                            saleVehicle,
                        }));
                    }
                  }
                }
              } else if (hasPNo) {
                const pNoArr = convertToArray(item.peripheralNo);
                if (pNoArr.length > 0) {
                  let pSnap = await getCollection(
                    firestore,
                    "sections/stocks/vehicles",
                    [["peripheralNo", "in", pNoArr]]
                  );
                  if (!pSnap) {
                    // In case user enter full number.
                    pSnap = await getCollection(
                      firestore,
                      "sections/stocks/vehicles",
                      [["peripheralNoFull", "in", pNoArr]]
                    );
                  }
                  if (pSnap) {
                    let pItem: any = {};
                    pSnap.forEach((doc) => {
                      if (!doc.data()?.sold) {
                        pItem = {...doc.data(), _id: doc.id};
                      }
                    });
                    !!pItem?._id &&
                      (await vehicleStockRef.doc(pItem._id).update({
                        sold,
                        baac: saleType === "baac" || null,
                        skl: saleType === "sklLeasing" || null,
                        kbnLeasing: saleType === "kbnLeasing" || null,
                        transactions: pItem?.transactions ?
                          pItem.transactions.concat(transaction) :
                          transaction,
                      }));
                  }
                }
              } else {
                // Check FIFO.
                const fSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [
                    [
                      "productPCode",
                      "==",
                      removeAllNonAlphaNumericCharacters(item.productCode),
                    ],
                    ["isFIFO", "==", true],
                    ["sold", "==", null],
                  ]
                );
                if (fSnap) {
                  const fItems: any[] = [];
                  fSnap.forEach((doc) => {
                    if (!doc.data()?.sold) {
                      fItems.push({...doc.data(), _id: doc.id});
                    }
                  });
                  fItems[0]?._id &&
                    (await vehicleStockRef.doc(fItems[0]._id).update({
                      sold,
                      baac: saleType === "baac" || null,
                      skl: saleType === "sklLeasing" || null,
                      kbnLeasing: saleType === "kbnLeasing" || null,
                      transactions: fItems[0]?.transactions ?
                        fItems[0].transactions.concat(transaction) :
                        transaction,
                    }));
                }
              }
              return item;
            });
          }
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateSaleOutChange = functions.region("asia-northeast1").firestore.document("/sections/stocks/saleOut/{deliverId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const before = change.before.data() || {};
      const updateItemsRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("saleOutItems");
      const customersRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");

      if (!before.deleted && after.deleted) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, deleted: after.deleted}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await updateItemsRef.doc(item.deliverItemId).update({
              deleted: after.deleted,
            });
          });
        }
      }
      if (!before.cancelled && after.cancelled) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, cancelled: after.cancelled}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await updateItemsRef.doc(item.deliverItemId).update({
              cancelled: after.cancelled,
            });
          });
        }
      }
      if (!before.rejected && after.rejected) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, rejected: after.rejected}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await updateItemsRef.doc(item.deliverItemId).update({
              rejected: after.rejected,
            });
          });
        }
      }
      if (!before.completed && after.completed && !!after?.items) {
        if (after.saleId) {
          // Update inventory recorded on sale.
          const sSnap = await getCollection(
            firestore,
            "sections/sales/vehicles",
            [["saleId", "==", after.saleId]]
          );
          if (sSnap) {
            await salesRef.doc(after.saleId).update({
              ivAdjusted: {
                ts: after.created || null,
                by: after.recordedBy || null,
              },
            });
          }
        }
        const saleType = after.saleType || null;
        if (after.items) {
          const cDoc = await getDoc(
            firestore,
            "data",
            `sales/customers/${after.customerId}`
          );
          if (cDoc) {
            const customer = cDoc.data();
            // Update stock item's sold out.
            const mItems = after.items;
            const transaction = [
              {
                ts: after.created || null,
                by: after.recordedBy || null,
                type: "saleOut",
                info: `ใบขายเลขที่: ${after.saleNo} ลูกค้า: ${after.customer}`,
                docId: after?.deliverId || null,
                customerId: after.customerId || null,
                customer: after.customer || null,
                saleId: after.saleId || null,
                saleNo: after.saleNo || null,
              },
            ];
            const sold = {
              deliverId: after?.deliverId || null,
              saleId: after.saleId || null,
              saleNo: after.saleNo || null,
              saleType: after.saleType || null,
              customerId: after.customerId || null,
              customer: after.customer || null,
              ts: after.created || null,
              by: after.salesPerson || [],
            };
            const owner = [
              {
                customer: after.customer,
                customerId: after.customerId,
                date: after.date,
              },
            ];
            await arrayForEach(mItems as any[], async (item: any) => {
              const saleVehicle: any[] = [
                {
                  model: getModelFromName(item.productName),
                  productName: item.productName,
                  vehicleNo: [],
                  date: after.date,
                  qty: item.qty,
                },
              ];
              const hasVNo = hasVehicleNo(item);
              const hasPNo = hasPeripheralNo(item);
              if (hasVNo) {
                const vNoArr = convertToArray(item.vehicleNo);
                saleVehicle[0].vehicleNo = vNoArr;
                if (vNoArr.length > 0) {
                  let vSnap = await getCollection(
                    firestore,
                    "sections/stocks/vehicles",
                    [["vehicleNo", "in", vNoArr]]
                  );
                  if (!vSnap) {
                    // In case user enter full number.
                    vSnap = await getCollection(
                      firestore,
                      "sections/stocks/vehicles",
                      [["vehicleNoFull", "in", vNoArr]]
                    );
                  }
                  if (vSnap) {
                    let vItem: any = {};
                    vSnap.forEach((doc) => {
                      if (!doc.data()?.sold) {
                        // In stocks.
                        vItem = {...doc.data(), _id: doc.id};
                      }
                    });
                    !!vItem?._id &&
                      (await vehicleStockRef.doc(vItem._id).update({
                        sold,
                        baac: saleType === "baac" || null,
                        skl: saleType === "sklLeasing" || null,
                        kbnLeasing: saleType === "kbnLeasing" || null,
                        transactions: vItem?.transactions ?
                          vItem.transactions.concat(transaction) :
                          transaction,
                        owner: vItem?.owner ? vItem.owner.concat(owner) : owner,
                      }));
                    // Update customer ownership.
                    if (customer) {
                      await customersRef.doc(after.customerId).set({
                        ...customer,
                        vehicles: customer?.vehicles ?
                          customer.vehicles.concat(saleVehicle) :
                          saleVehicle,
                      });
                    }
                  }
                }
              } else if (hasPNo) {
                const pNoArr = convertToArray(item.peripheralNo);
                if (pNoArr.length > 0) {
                  let pSnap = await getCollection(
                    firestore,
                    "sections/stocks/vehicles",
                    [["peripheralNo", "in", pNoArr]]
                  );
                  if (!pSnap) {
                    // In case user enter full number.
                    pSnap = await getCollection(
                      firestore,
                      "sections/stocks/vehicles",
                      [["peripheralNoFull", "in", pNoArr]]
                    );
                  }
                  if (pSnap) {
                    let pItem: any = {};
                    pSnap.forEach((doc) => {
                      if (!doc.data()?.sold) {
                        // In stocks.
                        pItem = {...doc.data(), _id: doc.id};
                      }
                    });
                    !!pItem?._id &&
                      (await vehicleStockRef.doc(pItem._id).update({
                        sold,
                        baac: saleType === "baac" || null,
                        skl: saleType === "sklLeasing" || null,
                        kbnLeasing: saleType === "kbnLeasing" || null,
                        transactions: pItem?.transactions ?
                          pItem.transactions.concat(transaction) :
                          transaction,
                      }));
                  }
                }
              } else {
                // Check FIFO
                const fSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [
                    [
                      "productPCode",
                      "==",
                      removeAllNonAlphaNumericCharacters(item.productCode),
                    ],
                    ["isFIFO", "==", true],
                    ["sold", "==", null],
                  ]
                );
                if (fSnap) {
                  const fItems: any[] = [];
                  fSnap.forEach((doc) => {
                    if (!doc.data()?.sold) {
                      // In stocks.
                      fItems.push({...doc.data(), _id: doc.id});
                    }
                  });
                  fItems[0]?._id &&
                    (await vehicleStockRef.doc(fItems[0]._id).update({
                      sold,
                      baac: saleType === "baac" || null,
                      skl: saleType === "sklLeasing" || null,
                      kbnLeasing: saleType === "kbnLeasing" || null,
                      transactions: fItems[0]?.transactions ?
                        fItems[0].transactions.concat(transaction) :
                        transaction,
                    }));
                }
              }
              return item;
            });
          }
        }
      }
      return null;
    } catch (e) {
      error(e);
      return null;
    }
  });

exports.updateOtherVehicleOut = functions.region("asia-northeast1").firestore.document("/sections/stocks/otherVehicleOut/{exportId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const order = snap.data() || {};
      const transaction = [
        {
          ts: order.created || null,
          by: order.recordedBy || null,
          type: "export",
          info: `เอกสารเลขที่: ${order.docNo} ปลายทาง: ${order.destination}`,
          docId: order?.exportId || null,
          docNo: order.docNo || null,
        },
      ];
      const exported = {
        exportId: order?.exportId || null,
        docNo: order.docNo || null,
        ts: order.created || null,
        by: order.recordedBy || null,
        destination: order?.destination || null,
      };
      if (!!order.receivedBy && !!order.receivedDate && !!order.items) {
        // Update stock item's exported.
        await arrayForEach(order.items as any[], async (item: any) => {
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            const vNoArr = convertToArray(item.vehicleNo);
            if (vNoArr.length > 0) {
              let vSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["vehicleNo", "in", vNoArr]]
              );
              if (!vSnap) {
                // In case user enter full number.
                vSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["vehicleNoFull", "in", vNoArr]]
                );
              }
              if (vSnap) {
                let vItem: any = {};
                vSnap.forEach((doc) => {
                  if (!doc.data()?.exported) {
                    vItem = {...doc.data(), _id: doc.id};
                  }
                });
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).set({
                    ...vItem,
                    exported,
                    transactions: vItem?.transactions ?
                      vItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            const pNoArr = convertToArray(item.peripheralNo);
            if (pNoArr.length > 0) {
              let pSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["peripheralNo", "in", pNoArr]]
              );
              if (!pSnap) {
                // In case user enter full number.
                pSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["peripheralNoFull", "in", pNoArr]]
                );
              }
              if (pSnap) {
                let pItem: any = {};
                pSnap.forEach((doc) => {
                  if (!doc.data()?.exported) {
                    pItem = {...doc.data(), _id: doc.id};
                  }
                });
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).set({
                    ...pItem,
                    exported,
                    transactions: pItem?.transactions ?
                      pItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else {
            // Check FIFO
            const fSnap = await getCollection(
              firestore,
              "sections/stocks/vehicles",
              [
                [
                  "productPCode",
                  "==",
                  removeAllNonAlphaNumericCharacters(item.productCode),
                ],
                ["isFIFO", "==", true],
                ["exported", "==", null],
              ]
            );
            if (fSnap) {
              const fItems: any[] = [];
              fSnap.forEach((doc) => {
                if (!doc.data()?.exported) {
                  fItems.push({...doc.data(), _id: doc.id});
                }
              });
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).set({
                  ...fItems[0],
                  exported,
                  transactions: fItems[0]?.transactions ?
                    fItems[0].transactions.concat(transaction) :
                    transaction,
                }));
            }
          }
          return item;
        });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateOtherVehicleOutChange = functions.region("asia-northeast1").firestore.document("/sections/stocks/otherVehicleOut/{exportId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data() || {};
      const before = change.before.data() || {};

      if (!before.deleted && after.deleted) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, deleted: after.deleted}));
          await change.after.ref.update({items: mItems});
        }
      }
      if (!before.cancelled && after.cancelled) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, cancelled: after.cancelled}));
          await change.after.ref.update({items: mItems});
        }
      }
      if (!before.rejected && after.rejected) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, rejected: after.rejected}));
          await change.after.ref.update({items: mItems});
        }
      }
      if (!before.completed && after.completed && !!after?.items) {
        // Update stock item's sold out.
        const mItems = after.items;
        const transaction = [
          {
            ts: after.created || null,
            by: after.recordedBy || null,
            type: "saleOut",
            info: `เอกสารเลขที่: ${after.docNo} ปลายทาง: ${after.destination}`,
            docId: after?.exportId || null,
          },
        ];
        const exported = {
          exportId: after?.exportId || null,
          docNo: after?.docNo || null,
          ts: after.created || null,
          by: after.recordedBy || null,
          destination: after.destination || null,
        };
        await arrayForEach(mItems as any[], async (item: any) => {
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            const vNoArr = convertToArray(item.vehicleNo);
            if (vNoArr.length > 0) {
              let vSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["vehicleNo", "in", vNoArr]]
              );
              if (!vSnap) {
                // In case user enter full number.
                vSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["vehicleNoFull", "in", vNoArr]]
                );
              }
              if (vSnap) {
                let vItem: any = {};
                vSnap.forEach((doc) => {
                  vItem = {...doc.data(), _id: doc.id};
                });
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).set({
                    ...vItem,
                    exported,
                    transactions: vItem?.transactions ?
                      vItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            const pNoArr = Array.isArray(item.peripheralNo) ?
              item.peripheralNo :
              item.peripheralNo.split(",");
            if (pNoArr.length > 0) {
              let pSnap = await getCollection(
                firestore,
                "sections/stocks/vehicles",
                [["peripheralNo", "in", pNoArr]]
              );
              if (!pSnap) {
                // In case user enter full number.
                pSnap = await getCollection(
                  firestore,
                  "sections/stocks/vehicles",
                  [["peripheralNoFull", "in", pNoArr]]
                );
              }
              if (pSnap) {
                let pItem: any = {};
                pSnap.forEach((doc) => {
                  pItem = {...doc.data(), _id: doc.id};
                });
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).set({
                    ...pItem,
                    exported,
                    transactions: pItem?.transactions ?
                      pItem.transactions.concat(transaction) :
                      transaction,
                  }));
              }
            }
          } else {
            // Check FIFO
            const fSnap = await getCollection(
              firestore,
              "sections/stocks/vehicles",
              [
                [
                  "productPCode",
                  "==",
                  removeAllNonAlphaNumericCharacters(item.productCode),
                ],
                ["isFIFO", "==", true],
                ["exported", "==", null],
              ]
            );
            if (fSnap) {
              const fItems: any[] = [];
              fSnap.forEach((doc) => {
                if (!doc.data()?.exported) {
                  fItems.push({...doc.data(), _id: doc.id});
                }
              });
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).set({
                  ...fItems[0],
                  exported,
                  transactions: fItems[0]?.transactions ?
                    fItems[0].transactions.concat(transaction) :
                    transaction,
                }));
            }
          }
          return item;
        });
      }
      return null;
    } catch (e) {
      error(e);
      return null;
    }
  });

exports.updateOtherVehicleImport = functions.region("asia-northeast1").firestore.document("/sections/stocks/otherVehicleIn/{importId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const {
        importDate,
        importId,
        docNo,
        origin,
        created,
        receivedBy,
        toDestination,
        deliveredBy,
        saleId,
        saleNo,
        customerId,
        customer,
        isUsed,
        subType,
        items,
      } = snap.data() || {};
      const vehicleStock: any[] = [];

      if (items) {
        await arrayForEach(items as any[], async (item: any) => {
          const productName = item?.productName || null;
          let vNoArr = [];
          let pNoArr = [];
          let eNoArr = [];
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            vNoArr = convertToArray(item.vehicleNo);
            vNoArr = cleanIdentityArray(vNoArr);
            pNoArr = item.peripheralNo ? convertToArray(item.peripheralNo) : [];
            pNoArr = cleanIdentityArray(pNoArr);
            eNoArr = item.engineNo ? convertToArray(item.engineNo) : [];
            eNoArr = cleanIdentityArray(eNoArr);
          } else if (hasPNo) {
            pNoArr = convertToArray(item.peripheralNo);
            pNoArr = cleanIdentityArray(pNoArr);
            eNoArr = item.engineNo ? convertToArray(item.engineNo) : [];
            eNoArr = cleanIdentityArray(eNoArr);
          }
          for (let i = 0; i < item.qty; i++) {
            let vehicleNo = "";
            let peripheralNo = "";
            let engineNo = "";

            const vNo = vNoArr.length > 0 ? vNoArr[i] || "" : "";
            const pNo = pNoArr.length > 0 ? pNoArr[i] || "" : "";
            const eNo = eNoArr.length > 0 ? eNoArr[i] || "" : "";

            if (!!vNo && ["number", "string"].includes(typeof vNo)) {
              vehicleNo = vNo.toString().trim();
              if (vehicleNo.startsWith(",")) {
                vehicleNo = vehicleNo.substring(1);
              }
            }
            if (!!pNo && ["number", "string"].includes(typeof pNo)) {
              peripheralNo = pNo.toString().trim();
              if (peripheralNo.startsWith(",")) {
                peripheralNo = peripheralNo.substring(1);
              }
            }
            if (!!eNo && ["number", "string"].includes(typeof eNo)) {
              engineNo = eNo.toString().trim();
              if (engineNo.startsWith(",")) {
                engineNo = engineNo.substring(1);
              }
            }

            const isVehicle = productName ?
              checkIsVehicleFromName(productName) :
              vNoArr.length > 0;

            let model = isVehicle ?
              getModelFromName(productName) :
              extractPeripheralModel(peripheralNo);
            if (model.length < 3) {
              model = getModelFromName(productName);
            }

            vehicleStock.push({
              ...searchVehicleObj,
              vehicleNo,
              vehicleNoFull: vehicleNo,
              productCode: item.productCode || null,
              branchCode: toDestination || null,
              productName: item.productName || null,
              docNo,
              productType: isVehicle ?
                !!item?.productCode && item.productCode.startsWith("2-") ?
                  "รถมือสอง" :
                  "รถใหม่" :
                !!item?.productCode && item.productCode.startsWith("2-") ?
                  "อุปกรณ์มือสอง" :
                  "อุปกรณ์ใหม่",
              isVehicle,
              isFIFO: !item?.vehicleNo && !item?.peripheralNo,
              isUsed,
              engineNo,
              vehicleNoLower: vehicleNo.toLowerCase(),
              vehicleNoPartial: partialText(vehicleNo),
              keywords: isVehicle ?
                createVehicleNoKeyWords(vehicleNo) :
                createPeripheralNoKeyWords(peripheralNo),
              productPCode: item?.productCode ?
                removeAllNonAlphaNumericCharacters(item.productCode) :
                null,
              peripheralNo,
              peripheralNoFull: peripheralNo,
              model,
              ...(!subType && {
                [subType]: {
                  docNo: docNo || null,
                  ts: created || null,
                  by: receivedBy || null,
                  importDate: importDate || null,
                  docId: importId || null,
                  ...(!!saleId && {saleId}),
                  ...(!!saleNo && {saleNo}),
                  ...(!!customerId && {customerId}),
                  ...(!!customer && {customer}),
                  deliveredBy,
                },
              }),
              peripheralNoLower: peripheralNo.toLowerCase(),
              peripheralNoPartial: partialText(peripheralNo),
              transactions: [
                {
                  ts: created,
                  by: receivedBy,
                  type: "importOther",
                  ...(!!subType && {subType}),
                  ...(!!item?.batchNo && {info: `BatchNo: ${item.batchNo}`}),
                  docNo,
                  origin,
                  importDate: importDate || null,
                  docId: importId,
                  ...(!!customerId && {customerId}),
                  ...(!!customer && {customer}),
                },
              ],
            });
          }
          return item;
        });
      }

      // Add inventory
      await arrayForEach(vehicleStock, async (vItem, i) => {
        let vId = vItem?.isVehicle ?
          vItem.vehicleNoFull :
          vItem.peripheralNoFull;
        if (vId.length < 8) {
          vId = createNewId("KVEH");
          vId = `${vId.slice(0, -1)}${i}`;
        }
        await vehicleStockRef.doc(vId).set(vItem);
      });
    } catch (e) {
      error(e);
    }
  });

exports.updateDecal = functions.region("asia-northeast1").firestore.document("/sections/stocks/decal/{docId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const {
        vehicleNo,
        engineNo,
        docNo,
        recordedBy,
        decalWithdrawDate,
        isDecal,
        isTakeOut,
        urlChassis,
        urlEngine,
      } = snap.data() || {};

      const vNo = cleanIdentityNumber(vehicleNo);
      const docId = context.params.docId;

      const decal = {
        decalWithdrawDate,
        isDecal,
        urlChassis,
        urlEngine,
        docId,
        docNo,
      };

      const transaction = [
        {
          ts: snap.data()?.created || null,
          by: recordedBy || null,
          type: "decal",
          docId,
          docNo,
          docDate: decalWithdrawDate,
          isDecal,
          isTakeOut,
        },
      ];

      const vSnap = await getCollection(firestore, "sections/stocks/vehicles", [
        ["vehicleNo", "==", vNo],
      ]);
      if (vSnap) {
        let vItem: any = {};
        vSnap.forEach((doc) => {
          vItem = {...doc.data(), _id: doc.id};
        });
        !!vItem?._id &&
          (await vehicleStockRef.doc(vItem._id).update({
            decal,
            transactions: vItem?.transactions ?
              vItem.transactions.concat(transaction) :
              transaction,
            ...(!!engineNo && {engineNo}),
            ...(!!urlChassis && {urlChassis}),
            ...(!!urlEngine && {urlEngine}),
          }));
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateDecalChange = functions.region("asia-northeast1").firestore.document("/sections/stocks/decal/{docId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      const after = change.after.data() || {};
      const before = change.before.data() || {};

      if (!before.isTakeOut && after.isTakeOut) {
        const {
          vehicleNo,
          docNo,
          recordedBy,
          decalWithdrawDate,
          isDecal,
          isTakeOut,
          urlChassis,
          urlEngine,
        } = after;

        const vNo = cleanIdentityNumber(vehicleNo);
        const docId = context.params.docId;

        const decalTaken = {
          decalWithdrawDate,
          isDecal,
          isTakeOut,
          urlChassis,
          urlEngine,
          docId,
          docNo,
        };

        const transaction = [
          {
            by: recordedBy || null,
            type: "decalTaken",
            docId,
            docNo,
            docDate: decalWithdrawDate,
            isDecal,
            isTakeOut,
          },
        ];

        const vSnap = await getCollection(firestore, "sections/stocks/vehicles", [
          ["vehicleNo", "==", vNo],
        ]);
        if (vSnap) {
          let vItem: any = {};
          vSnap.forEach((doc) => {
            vItem = {...doc.data(), _id: doc.id};
          });
          !!vItem?._id &&
            (await vehicleStockRef.doc(vItem._id).update({
              decalTaken,
              transactions: vItem?.transactions ?
                vItem.transactions.concat(transaction) :
                transaction,
            }));
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateDeliveryPlan = functions.region("asia-northeast1").firestore.document("/sections/stocks/deliver/{deliverId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const order = snap.data() || {};
      if (order.items) {
        await arrayForEach(order.items as any[], async (item: any) => {
          const isVehicle = item?.productName ?
            checkIsVehicleFromName(item.productName) :
            item?.vNoArr && item.vNoArr.length > 0;
          let model = isVehicle ?
            getModelFromName(item.productName) :
            extractPeripheralModel(item.peripheralNo);
          if (model.length < 3) {
            model = getModelFromName(item.productName);
          }
          let deliverItem = {
            ...item,
            date: order.date,
            branchCode: order.branchCode,
            docNo: order.docNo,
            docNoLower: order.docNo.toLowerCase(),
            deliverId: order.deliverId,
            deliverType: order.deliverType,
            fromOrigin: order?.fromOrigin || null,
            toDestination: order?.toDestination || null,
            saleDate: order?.saleDate || null,
            saleId: order?.saleId || null,
            saleNo: order?.saleNo || null,
            saleType: order?.saleType || null,
            customerId: order?.customerId || null,
            customer: order?.customer || null,
            address: order?.address || null,
            phoneNumber: order?.phoneNumber || null,
            deleted: order.deleted,
            deliveredTime: order?.deliveredTime || null,
            deliveredDate: order?.deliveredDate || null,
            deliveredBy: order?.deliveredBy || null,
            recordedBy: order?.recordedBy || null,
            model,
            isVehicle,
          };
          deliverItem = cleanValuesBeforeSave(deliverItem);
          log(deliverItem);
          await deliverItemsRef.doc(item.deliverItemId).set(deliverItem);
        });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateDeliveryPlanChange = functions.region("asia-northeast1").firestore.document("/sections/stocks/deliver/{deliverId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      const after = change.after.data() || {};
      const before = change.before.data() || {};

      if (!before.deleted && after.deleted) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, deleted: after.deleted}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await deliverItemsRef.doc(item.deliverItemId).update({
              deleted: after.deleted,
            });
          });
        }
      }
      if (!before.cancelled && after.cancelled) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, cancelled: after.cancelled}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await deliverItemsRef.doc(item.deliverItemId).update({
              cancelled: after.cancelled,
            });
          });
        }
      }
      if (!before.rejected && after.rejected) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l: any) => ({...l, rejected: after.rejected}));
          await change.after.ref.update({items: mItems});
          await arrayForEach(after.items as any[], async (item: any) => {
            await deliverItemsRef.doc(item.deliverItemId).update({
              rejected: after.rejected,
            });
          });
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateAccountIncome = functions.region("asia-northeast1").firestore.document("/sections/account/incomes/{incomeId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const incomeRef = firestore
        .collection("sections")
        .doc("account")
        .collection("incomes");
      const {payments} = snap.data() || {};
      const hasBankTransfer =
        !!payments &&
        Array.isArray(payments) &&
        payments.filter(
          (l: any) => l.paymentType === "transfer" && Number(l.amount) > 0
        ).length > 0;

      const hasPLoan =
        !!payments &&
        Array.isArray(payments) &&
        payments.filter(
          (l: any) => l.paymentType === "pLoan" && Number(l.amount) > 0
        ).length > 0;

      await incomeRef
        .doc(context.params.incomeId)
        .update({hasBankTransfer, hasPLoan});

      if (hasPLoan) {
        await incomeRef
          .doc(context.params.incomeId)
          .update({pLoanPayments: []});
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateAccountExpense = functions.region("asia-northeast1").firestore.document("/sections/account/expenses/{expenseId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const expenseRef = firestore
        .collection("sections")
        .doc("account")
        .collection("expenses");
      const snapshot = snap.data() || {};
      // Insert tag 'isPart' to identify part/vehicle invoice ('purchaseTransfer' expense type only).
      if (
        snapshot.expenseType !== "purchaseTransfer" ||
        typeof snapshot?.isPart !== "undefined"
      ) {
        log("NO_NEED_TO_UPDATE_ACCOUNT_EXPENSE: ", context.params.expenseId);
        return;
      }
      if (!(snapshot?.billNoSKC || snapshot?.receiveNo)) {
        log("UNABLE_TO_UPDATE_ACCOUNT_EXPENSE: ", context.params.expenseId);
        return;
      }
      let isPart = true;
      if (snapshot?.billNoSKC) {
        isPart = snapshot.billNoSKC.startsWith("80");
      } else {
        isPart = snapshot.receiveNo.startsWith("90");
      }
      const newValues = {...snapshot, isPart};
      await expenseRef.doc(context.params.expenseId).set(newValues);
    } catch (e) {
      error("ERROR_UPDATE_ACCOUNT_EXPENSE ", e);
      error("SNAPSHOT: ", JSON.stringify(snap.data(), null, 2));
    }
  });

exports.onHRLeaveCreate = functions.region("asia-northeast1").firestore.document("/sections/hr/leave/{docId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const snapshot = snap.data() || {};
      const {fromDate, toDate} = snapshot;
      // Get array of dates.
      const dates = getDates(fromDate, toDate);
      const newValues = {...snapshot, dates};

      const updateRef = firestore
        .collection("sections")
        .doc("hr")
        .collection("leave")
        .doc(context.params.docId);
      await updateRef.set(newValues);
    } catch (e) {
      error(e);
    }
  });

exports.updateHRLeave = functions.region("asia-northeast1").firestore.document("/sections/hr/leave/{docId}")
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      const after = change.after.data() || {};
      const before = change.before.data() || {};
      const docId = context.params.docId;
      const beforeFromDate = before.fromDate;
      const beforeToDate = before.toDate;
      const afterFromDate = after.fromDate;
      const afterToDate = after.toDate;

      if (beforeFromDate !== afterFromDate || beforeToDate !== afterToDate) {
        const {fromDate, toDate} = after;
        // Get array of dates.
        const dates = getDates(fromDate, toDate);

        const updateRef = firestore
          .collection("sections")
          .doc("hr")
          .collection("leave")
          .doc(docId);
        await updateRef.update({dates});
      }
    } catch (e) {
      error(e);
    }
  });

/**
 * Cloud Function: userCreated
 * Triggered when a new Firebase Auth user is created.
 * Updates the user's group in Firestore based on displayName.
 */
exports.userCreated = functions.region("asia-northeast1").auth.user().onCreate(async (user, context) => {
  try {
    const userFirestoreRef = firestore.collection("users").doc(user.uid);
    const group = user.displayName && user.displayName.includes("เบญจพลกุล") ?
      "group001" :
      "group011";
    await userFirestoreRef.update({group});
    log(`User ${user.email} created and successfully updated.`);
  } catch (e) {
    console.error(e);
  }
});

/**
 * Cloud Function: removeUser
 * Triggered when a Firebase Auth user is deleted.
 * Cleans up user data in Firestore and Realtime Database.
 */
exports.removeUser = functions.region("asia-northeast1").auth.user().onDelete(async (user, context) => {
  try {
    await firestore.collection("users").doc(user.uid).delete();
    await firestore.collection("status").doc(user.uid).delete();
    await admin.database().ref(`status/${user.uid}`).remove();
    log(`User ${user.email} successfully deleted.`);
  } catch (e) {
    console.error(e);
  }
});

/**
 * Cloud Function: onUserStatusChanged
 * Syncs Realtime Database status to Firestore for user presence tracking.
 */
exports.onUserStatusChanged = functions.region("asia-northeast1").database.ref("/status/{uid}").onUpdate(async (change, context) => {
  try {
    const eventStatus = change.after.val();
    const userStatusFirestoreRef = firestore.doc(`status/${context.params.uid}`);
    const statusSnapshot = await change.after.ref.once("value");
    const status = statusSnapshot.val();
    if (status && status.last_changed > eventStatus.last_changed) {
      return null;
    }
    return userStatusFirestoreRef.set(eventStatus);
  } catch (e) {
    console.error(e);
    return null; // Added explicit return for all code paths
  }
});

/**
 * Cloud Function: getNotifications
 * Retrieves notifications for a user with province-based filtering and RBAC enforcement
 */
exports.getNotifications = functions.region("asia-northeast1").https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to access notifications"
      );
    }

    const userId = data.userId || context.auth.uid;
    const provinceId = data.provinceId || null;
    const limit = data.limit || 50;

    // Verify user requesting matches authenticated user or has admin permissions
    if (userId !== context.auth.uid) {
      // Check if requesting user is admin/super_admin/developer
      const userDoc = await firestore.collection("users").doc(context.auth.uid).get();
      const userData = userDoc.data() || {};

      const adminRoles = ["ADMIN", "SUPER_ADMIN", "DEVELOPER"];
      if (!adminRoles.includes(userData.role)) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Cannot access notifications for other users"
        );
      }
    }

    // Get user data to check roles and province access
    const targetUserDoc = await firestore.collection("users").doc(userId).get();
    const targetUserData = targetUserDoc.data() || {};

    // Build query based on RBAC
    let notificationsQuery = firestore.collection("notifications")
      .where("expiresAt", ">", admin.firestore.Timestamp.now())
      .orderBy("expiresAt", "desc")
      .orderBy("createdAt", "desc")
      .limit(limit);

    // If province filtering is requested, check user's role for province access
    if (provinceId) {
      // Check if user has access to this province
      const hasProvinceAccess = await checkUserProvinceAccess(userId, provinceId);

      if (!hasProvinceAccess) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User does not have access to this province"
        );
      }

      // Include both province-specific and system-wide notifications
      notificationsQuery = notificationsQuery.where("provinceId", "in", [provinceId, null]);
    } else {
      // For users who can't see all provinces, restrict to their province or system-wide
      const canViewAllProvinces = ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "GENERAL_MANAGER"].includes(targetUserData.role);

      if (!canViewAllProvinces && targetUserData.provinceId) {
        notificationsQuery = notificationsQuery.where("provinceId", "in", [targetUserData.provinceId, null]);
      }
    }

    const snapshot = await notificationsQuery.get();
    // Explicitly type the notifications array to avoid implicit 'any[]'
    const notifications: Array<Record<string, unknown>> = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check if notification is relevant to the user based on targeting
      const isRelevant =
        // No targeting specified - for all users
        (!data.targetRoles && !data.targetBranch && !data.targetDepartment) ||
        // Role targeting
        (data.targetRoles && targetUserData.role && data.targetRoles.includes(targetUserData.role)) ||
        // Branch targeting
        (data.targetBranch && targetUserData.branch && data.targetBranch === targetUserData.branch) ||
        // Department targeting
        (data.targetDepartment && targetUserData.department && data.targetDepartment === targetUserData.department);

      if (isRelevant) {
        const readBy = data.readBy || [];
        const isRead = readBy.includes(userId);

        notifications.push({
          id: doc.id,
          ...data,
          isRead,
        });
      }
    });

    return {notifications};
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new functions.https.HttpsError(
      "internal",
      error instanceof Error ? error.message : "Error retrieving notifications"
    );
  }
});

/**
 * Cloud Function: markAllNotificationsAsRead
 * Marks all notifications as read for a user with optional province filtering
 */
exports.markAllNotificationsAsRead = functions.region("asia-northeast1").https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = data.userId || context.auth.uid;
    const provinceId = data.provinceId || null;

    // Verify user requesting matches authenticated user or has admin permissions
    if (userId !== context.auth.uid) {
      // Check if requesting user is admin
      const userDoc = await firestore.collection("users").doc(context.auth.uid).get();
      const userData = userDoc.data() || {};

      const adminRoles = ["ADMIN", "SUPER_ADMIN", "DEVELOPER"];
      if (!adminRoles.includes(userData.role)) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Cannot mark notifications for other users"
        );
      }
    }

    // Build query for notifications to update
    let notificationsQuery = firestore.collection("notifications")
      .where("expiresAt", ">", admin.firestore.Timestamp.now());

    // If province filtering is requested, check user's role for province access
    if (provinceId) {
      // Check if user has access to this province
      const hasProvinceAccess = await checkUserProvinceAccess(userId, provinceId);

      if (!hasProvinceAccess) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User does not have access to this province"
        );
      }

      // Include both province-specific and system-wide notifications
      notificationsQuery = notificationsQuery.where("provinceId", "in", [provinceId, null]);
    }

    // Get the notifications
    const snapshot = await notificationsQuery.get();

    // Use a batched write for better performance
    const batch = firestore.batch();
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const readBy = data.readBy || [];

      // Only update if not already read by this user
      if (!readBy.includes(userId)) {
        batch.update(doc.ref, {
          readBy: admin.firestore.FieldValue.arrayUnion(userId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updateCount++;
      }
    });

    // Only commit if there are changes to make
    if (updateCount > 0) {
      await batch.commit();
    }

    return {success: true, updatedCount: updateCount};
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw new functions.https.HttpsError(
      "internal",
      error instanceof Error ? error.message : "Error marking notifications as read"
    );
  }
});

/**
 * Cloud Function: sendPushNotification
 * Sends push notifications to specified users with RBAC checks
 */
exports.sendPushNotification = functions.region("asia-northeast1").https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send notifications"
      );
    }

    const {notification, userIds, provinceId} = data;

    if (!notification || !notification.title || !notification.body) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Notification must include title and body"
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User IDs must be provided"
      );
    }

    // Verify caller has permission to send notifications
    const callerDoc = await firestore.collection("users").doc(context.auth.uid).get();
    const callerData = callerDoc.data() || {};

    // Check if caller has the right role/permission
    const notificationRoles = ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "GENERAL_MANAGER", "PROVINCE_MANAGER"];
    const hasPermission = notificationRoles.includes(callerData.role);

    if (!hasPermission) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User does not have permission to send notifications"
      );
    }

    // If province-specific notification, check caller's access to province
    if (provinceId) {
      const hasProvinceAccess = await checkUserProvinceAccess(context.auth.uid, provinceId);

      if (!hasProvinceAccess) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User does not have access to send notifications for this province"
        );
      }
    }

    // Get FCM tokens for the users
    const tokens = await getTokensForUsers(userIds);

    if (tokens.length === 0) {
      return {
        success: true,
        message: "No valid FCM tokens found for users",
        successCount: 0,
        failureCount: 0,
      };
    }

    // Send the notification
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens,
    };

    const response = await messaging.sendMulticast(message);

    // Clean up invalid tokens
    await Promise.all(
      response.responses.map(async (res, idx) => {
        if (!res.success && res.error && [
          "messaging/invalid-registration-token",
          "messaging/registration-token-not-registered",
        ].includes(res.error.code)) {
          const invalidToken = tokens[idx];
          await cleanupInvalidToken(invalidToken);
        }
      })
    );

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw new functions.https.HttpsError(
      "internal",
      error instanceof Error ? error.message : "Error sending push notification"
    );
  }
});

/**
 * Helper function to check if a user has access to a province
 * @param userId - User ID to check
 * @param provinceId - Province ID to check access for
 * @return Promise<boolean> - Whether user has access
 */
async function checkUserProvinceAccess(userId: string, provinceId: string): Promise<boolean> {
  try {
    const userDoc = await firestore.collection("users").doc(userId).get();
    const userData = userDoc.data() || {};

    // Admin, super admin, and developer roles have access to all provinces
    if (["ADMIN", "SUPER_ADMIN", "DEVELOPER"].includes(userData.role)) {
      return true;
    }

    // General managers have access to their assigned provinces
    if (userData.role === "GENERAL_MANAGER" && userData.accessibleProvinces) {
      return userData.accessibleProvinces.includes(provinceId);
    }

    // Province managers, branch managers, and other roles only have access to their assigned province
    if (["PROVINCE_MANAGER", "BRANCH_MANAGER", "LEAD", "USER", "BRANCH"].includes(userData.role)) {
      return userData.provinceId === provinceId;
    }

    // Default to no access
    return false;
  } catch (error) {
    console.error("Error checking province access:", error);
    return false;
  }
}

/**
 * Helper function to get FCM tokens for specified users
 * @param userIds - Array of user IDs to get tokens for
 * @return Promise<string[]> - Array of FCM tokens
 */
async function getTokensForUsers(userIds: string[]): Promise<string[]> {
  try {
    const tokens: string[] = [];

    // Query for tokens associated with the users
    for (const userId of userIds) {
      const snapshot = await firestore.collection("fcmTokens")
        .where("userId", "==", userId)
        .get();

      snapshot.forEach((doc) => {
        if (doc.data().token) {
          tokens.push(doc.data().token);
        }
      });
    }

    return tokens;
  } catch (error) {
    console.error("Error getting tokens for users:", error);
    return [];
  }
}

/**
 * Helper function to clean up invalid FCM tokens
 * @param token - Invalid token to clean up
 */
async function cleanupInvalidToken(token: string): Promise<void> {
  try {
    const snapshot = await firestore.collection("fcmTokens")
      .where("token", "==", token)
      .get();

    snapshot.forEach((doc) => doc.ref.delete());
  } catch (error) {
    console.error("Error cleaning up invalid token:", error);
  }
}
