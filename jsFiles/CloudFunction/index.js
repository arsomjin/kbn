/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const {
  log,
  info,
  debug,
  warn,
  error,
  write,
} = require("firebase-functions/logger");
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
const { CloudTasksClient } = require("@google-cloud/tasks");
admin.initializeApp();

const firestore = admin.firestore();
const database = admin.database();
const messaging = admin.messaging();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const gfirestore = require("@google-cloud/firestore");
const client = new gfirestore.v1.FirestoreAdminClient();

const bucket = "gs://kubota-benjapol-backup-bucket";

const _ = require("lodash");
const {
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
  updateOtherCollection,
  getCollection,
  getDoc,
  createNewId,
  convertToArray,
  cleanIdentityArray,
  cleanIdentityNumber,
  checkIsVehicleFromName,
  extractNumbersFromLastLetter,
  createKeywords,
  createBillNoSKCKeywords,
  getDates,
  hasVehicleNo,
  hasPeripheralNo,
} = require("./utils");

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
const partStockRef = firestore
  .collection("sections")
  .doc("stocks")
  .collection("parts");
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

const initAddress = {
  address: null,
  moo: null,
  village: null,
  tambol: null,
  amphoe: null,
  province: null,
  postcode: null,
};

const searchVehicleObj = {
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

exports.userCreated = functions
  .region("asia-northeast1")
  .auth.user()
  .onCreate(async (snap, context) => {
    try {
      const user = snap; // The Firebase user.
      // console.log('snap: ', snap);
      const userFirestoreRef = firestore.collection("users").doc(user.uid);
      const group =
        user && user.displayName && user.displayName.includes("เบญจพลกุล")
          ? "group001"
          : "group011";
      await userFirestoreRef.update({
        group,
      });
      log(`User ${user.email} created and successfully updated.`);
    } catch (e) {
      console.error(e);
    }
  });

exports.removeUser = functions
  .region("asia-northeast1")
  .auth.user()
  .onDelete(async (snap, context) => {
    try {
      const user = snap; // The Firebase user.
      // console.log('snap: ', snap);
      await firestore.collection("users").doc(user.uid).delete();
      await firestore.collection("status").doc(user.uid).delete();
      await database.ref(`status/${user.uid}`).remove();
      log(`User ${user.email} successfully deleted.`);
    } catch (e) {
      console.error(e);
    }
  });

exports.onUserStatusChanged = functions
  .region("asia-northeast1")
  .database.ref("/status/{uid}")
  .onUpdate(async (change, context) => {
    try {
      // Get the data written to Realtime Database
      const eventStatus = change.after.val();

      // Then use other event data to create a reference to the
      // corresponding Firestore document.
      const userStatusFirestoreRef = firestore.doc(
        `status/${context.params.uid}`
      );

      // It is likely that the Realtime Database change that triggered
      // this event has already been overwritten by a fast change in
      // online / offline status, so we'll re-read the current data
      // and compare the timestamps.
      const statusSnapshot = await change.after.ref.once("value");
      const status = statusSnapshot.val();
      // console.log(status, eventStatus);
      // If the current timestamp for this data is newer than
      // the data that triggered this event, we exit this function.
      if (status && status.last_changed > eventStatus.last_changed) {
        return null;
      }

      // Otherwise, we convert the last_changed field to a Date
      // eventStatus.last_changed = new Date(eventStatus.last_changed);
      // ... and write it to Firestore.
      return userStatusFirestoreRef.set(eventStatus);
    } catch (e) {
      console.error(e);
    }
  });

async function getTokens(cond = {}) {
  let tokensRef = firestore.collection("messageTokens");
  const { group, department, branch } = cond;
  if (group) {
    tokensRef = tokensRef.where("group", "==", group);
  }
  if (department) {
    tokensRef = tokensRef.where("department", "==", department);
  }
  if (branch) {
    tokensRef = tokensRef.where("branch", "==", branch);
  }
  const snapshot = await tokensRef.get();
  return snapshot.docs.map((doc) => doc.data().token);
}

const sendNotification = async (payload) => {
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

    return { successes, failures };
  }
  return null;
};

exports.notifyUsers = functions
  .region("asia-northeast1")
  .firestore.document("/messages/{messageId}")
  .onCreate(async (snap, context) => {
    try {
      const newMessage = snap.data();
      const { branch, department, group } = newMessage;
      const messageId = context.params.messageId;
      const data = { ...newMessage, messageId };
      log({ data, messageId });
      const tokens = await getTokens({ branch, department, group });
      const payload = {
        data,
        tokens,
      };
      const notify = await sendNotification(payload);
      const { successes, failures } = notify;
      log("Notifications sent:", `${successes} successful, ${failures} failed`);
    } catch (e) {
      log(e);
    }
  });

// Utility function to check if only createdAt field changed
function onlyCreatedAtChanged(before, after) {
  const beforeKeys = Object.keys(before || {});
  const afterKeys = Object.keys(after || {});
  const allKeys = new Set([...beforeKeys, ...afterKeys]);

  let changedKeys = [];

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

exports.scheduledFirestoreBackup = functions
  .region("asia-northeast1")
  .pubsub.schedule("every 24 hours")
  .onRun((context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, "(default)");

    return client
      .exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        // Leave collectionIds empty to export all collections
        // or set to a list of collection IDs to export,
        // collectionIds: ['users', 'posts']
        collectionIds: [],
      })
      .then((responses) => {
        const response = responses[0];
        return log(`DAILY FIRESTORE BACKUP: ${response["name"]}`);
      })
      .catch((err) => {
        console.error(err);
        throw new Error("FIRESTORE BACKUP FAILED", JSON.stringify(err));
      });
  });

exports.updateWhenNewVehicleProductAdd = functions
  .region("asia-northeast1")
  .firestore.document("/data/products/vehicleList/{vehicleId}")
  .onCreate(async (snap, context) => {
    const vehicleId = context.params.vehicleId;
    try {
      let values = snap.data();
      let newValues = Object.assign(
        {},
        addSearchFields(values, ["name", "productCode", "productType"])
      );
      let header = getVehicleHeader(newValues.name);
      let model = getModelFromName(newValues.name);
      newValues.deleted = false;
      newValues.header = header;
      newValues.model = model;
      newValues.keywords = createProductKeywords(newValues);
      newValues.isUsed = newValues.productCode.startsWith("2-");
      newValues.productPCode = removeAllNonAlphaNumericCharacters(
        newValues.productCode
      );
      let updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("vehicleList")
        .doc(vehicleId);
      await updateRef.set(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateVehicleProductList = functions
  .region("asia-northeast1")
  .firestore.document("/data/products/vehicleList/{vehicleId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      const vehicleId = context.params.vehicleId;
      let values = after;
      let newValues = Object.assign(
        {},
        addSearchFields(values, ["name", "productCode", "productType"])
      );
      let header = getVehicleHeader(newValues.name);
      let model = getModelFromName(newValues.name);
      newValues.header = header;
      newValues.model = model;
      newValues.keywords = createProductKeywords(newValues);
      newValues.isUsed = newValues.productCode.startsWith("2-");
      newValues.productPCode = removeAllNonAlphaNumericCharacters(
        newValues.productCode
      );

      let updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("vehicleList")
        .doc(vehicleId);
      await updateRef.update(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateWhenNewPartProductAdd = functions
  .region("asia-northeast1")
  .firestore.document("/data/products/partList/{partId}")
  .onCreate(async (snap, context) => {
    const partId = context.params.partId;
    try {
      let values = snap.data();
      let newValues = addSearchFields(values, ["name", "pCode", "model"]);
      let updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("partList")
        .doc(partId);
      await updateRef.set(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updatePartProductList = functions
  .region("asia-northeast1")
  .firestore.document("/data/products/partList/{partId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      const partId = context.params.partId;
      let values = after;
      let newValues = addSearchFields(values, ["name", "pCode", "model"]);

      let updateRef = firestore
        .collection("data")
        .doc("products")
        .collection("partList")
        .doc(partId);
      await updateRef.update(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateWhenNewServiceAdd = functions
  .region("asia-northeast1")
  .firestore.document("/data/services/serviceList/{serviceId}")
  .onCreate(async (snap, context) => {
    const serviceId = context.params.serviceId;
    try {
      let values = snap.data();
      let newValues = addSearchFields(values, ["name", "serviceCode"]);
      let updateRef = firestore
        .collection("data")
        .doc("services")
        .collection("serviceList")
        .doc(serviceId);
      await updateRef.set(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateServiceList = functions
  .region("asia-northeast1")
  .firestore.document("/data/services/serviceList/{serviceId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      const serviceId = context.params.serviceId;
      let values = after;
      let newValues = addSearchFields(values, ["name", "serviceCode"]);

      let updateRef = firestore
        .collection("data")
        .doc("services")
        .collection("serviceList")
        .doc(serviceId);
      await updateRef.update(newValues);
    } catch (e) {
      log(e);
    }
  });

exports.updateVehicleImport = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/importVehicles/{vehicleId}")
  .onCreate(async (snap, context) => {
    try {
      const newVehicle = snap.data();
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
      } = snap.data();

      let keywords = createBillNoSKCKeywords(billNoSKC);
      await importVehicleRef.doc(context.params.vehicleId).update({ keywords });

      let vehicleArr = convertToArray(vehicleNo);
      let peripheralArr = convertToArray(peripheralNo);
      let engineArr = convertToArray(engineNo);

      let isVehicle = storeLocationCode
        ? storeLocationCode.startsWith("NV")
        : checkIsVehicleFromName(productName);

      let vehicleStock = [];

      for (let i = 0; i < qty; i++) {
        let vNo = vehicleArr[i];
        let str = "";
        let vNoShort = "";
        let pNo = peripheralArr[i];
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

        let model = isVehicle
          ? getModelFromName(productName)
          : extractPeripheralModel(str2);
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
          vehicleNo_lower: vNoShort.toLowerCase(),
          vehicleNo_partial: partialText(vNoShort),
          keywords: isVehicle
            ? createVehicleNoKeyWords(vNoShort)
            : createPeripheralNoKeyWords(pNoShort),
          productPCode: removeAllNonAlphaNumericCharacters(productCode),
          peripheralNo: pNoShort,
          peripheralNoFull: str2,
          model,
          peripheralNo_lower: pNoShort.toLowerCase(),
          peripheralNo_partial: partialText(pNoShort),
          transactions: [
            {
              ts: importTime,
              by: importBy,
              type: "import",
              ...(batchNo && { info: `BatchNo: ${batchNo}` }),
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

exports.updateVehicleUnitPrice = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/importVehicles/{vehicleId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      if (!before.unitPrice && after.unitPrice) {
        let peripheralArr = convertToArray(after.peripheralNo);
        let vehicleArr = convertToArray(after.vehicleNo);
        let isVehicle = after.storeLocationCode
          ? after.storeLocationCode.startsWith("NV")
          : checkIsVehicleFromName(after.productName);
        let wheres = isVehicle
          ? [["vehicleNoFull", "in", vehicleArr]]
          : [["peripheralNoFull", "in", peripheralArr]];
        let vSnap = await getCollection(
          firestore,
          "sections/stocks/vehicles",
          wheres
        );
        if (vSnap) {
          let items = [];
          vSnap.forEach((doc) => {
            items.push({ ...doc.data(), _key: doc.id });
          });
          items.length > 0 &&
            (await vehicleStockRef.doc(items[0]._key).update({
              unitPrice: after.unitPrice,
              discount: after.discount,
            }));
        }
      }
    } catch (e) {
      log(e);
    }
  });

exports.recheckImportKeywords = functions
  .region("asia-northeast1")
  .https.onRequest(async (req, res) => {
    const payload = req.body;
    try {
      // await firestore.doc(payload.docPath).delete()
      log("CLOUD_TASK_TRIGGED", payload);
      const { ts, dataType, batchNo } = payload;
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
        let wheres = [["batchNo", "==", batchNo]];
        let vSnap = await getCollection(firestore, path, wheres);
        if (vSnap) {
          let items = [];
          vSnap.forEach((doc) => {
            items.push({ ...doc.data(), _key: doc.id });
          });
          let noKeywords = items.filter((l) => !l.keywords);
          if (noKeywords.length > 0) {
            await arrayForEach(noKeywords, async (it) => {
              if (it.billNoSKC) {
                let keywords = createBillNoSKCKeywords(it.billNoSKC);
                if (dataType === "parts") {
                  await importPartRef.doc(it._key).update({ keywords });
                } else if (dataType === "vehicles") {
                  await importVehicleRef.doc(it._key).update({ keywords });
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
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

exports.afterImportTrigger = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/importLog/{docId}")
  .onCreate(async (snap, context) => {
    try {
      const docId = context.params.docId;
      const { ts, dataType, batchNo } = snap.data();
      const project = "kubota-benjapol";
      const location = "us-central1"; // asia-northeast1 not working.
      const queue = "KUBOTA-QUEUE";
      const tasksClient = new CloudTasksClient();
      const queuePath = tasksClient.queuePath(project, location, queue);
      const url = `https://${location}-${project}.cloudfunctions.net/recheckImportKeywords`;
      const payload = { ts, dataType, batchNo };
      const task = {
        httpRequest: {
          httpMethod: "POST",
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

exports.updatePartImport = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/importParts/{partId}")
  .onCreate(async (snap, context) => {
    try {
      const { billNoSKC } = snap.data();
      const partId = context.params.partId;
      if (!!billNoSKC && !!partId) {
        let keywords = createBillNoSKCKeywords(billNoSKC);
        log({ billNoSKC, partId, keywords });
        await importPartRef.doc(partId).update({ keywords });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateNewCustomer = functions
  .region("asia-northeast1")
  .firestore.document("/data/sales/customers/{customerId}")
  .onCreate(async (snap, context) => {
    const customerId = context.params.customerId;
    try {
      let values = snap.data();
      let newValues = addSearchFields(values, [
        "firstName",
        "lastName",
        "phoneNumber",
        "customerNo",
        "customerId",
      ]);
      let updateRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers")
        .doc(customerId);
      await updateRef.set(newValues);
    } catch (e) {
      error(e);
    }
  });

exports.onUpdateSaleVehicles = functions
  .region("asia-northeast1")
  .firestore.document("/sections/sales/vehicles/{saleId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      const {
        bookNo,
        creditRecorded,
        creditInfo,
        saleCutoffDate,
        referringDetails,
      } = after;
      // Update booking data.
      if (bookNo && !!saleCutoffDate && !before.saleCutoffDate) {
        let bSnap = await getCollection(firestore, "sections/sales/bookings", [
          ["bookPNo", "==", removeAllNonAlphaNumericCharacters(bookNo)],
        ]);
        if (bSnap) {
          let bItem = {};
          bSnap.forEach((doc) => {
            bItem = { ...doc.data(), _id: doc.id };
          });
          !!bItem?._id &&
            (await bookingsRef.doc(bItem._id).update({
              ...(!!creditRecorded && { creditRecorded }),
              ...(!!creditInfo && { creditInfo }),
              ...(!!saleCutoffDate && { saleCutoffDate }),
              ...(!!referringDetails && { referringDetails }),
            }));
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateReportSaleVehicles = functions
  .region("asia-northeast1")
  .firestore.document("/sections/sales/vehicles/{saleId}")
  .onCreate(async (snap, context) => {
    try {
      let reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("vehicles");
      let mktChannelsRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("mktChannels");
      let customerRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");
      const {
        date,
        saleId,
        saleNo,
        saleNo_lower,
        saleNo_partial,
        branchCode,
        customerId,
        customer,
        prefix,
        firstName,
        firstName_lower,
        firstName_partial,
        lastName,
        phoneNumber,
        items,
        saleType,
        salesPerson,
        sourceOfData,
        address,
        amtTurnOverVehicle,
        amtTurnOver,
        turnOverItems,
        bookNo,
        referrer,
      } = snap.data();
      let extraSnap = items ? getExtraSaleSnap(items) : {};
      let mAddress = address || initAddress;
      if (!address?.amphoe && !!customerId) {
        let cusDoc = await customerRef.doc(customerId).get();
        if (cusDoc) {
          mAddress = cusDoc.data()?.address || initAddress;
        }
      }
      const { village, tambol, amphoe, province, postcode } = mAddress;
      let extraSnap2 = {
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
        .set({ ...snap.data(), ...extraSnap, ...extraSnap2 });
      await mktChannelsRef.doc(context.params.saleId).set({
        date,
        saleId,
        saleNo,
        saleNo_lower,
        saleNo_partial,
        branchCode,
        customerId,
        prefix,
        firstName,
        firstName_lower,
        firstName_partial,
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
        let bSnap = await getCollection(firestore, "sections/sales/bookings", [
          ["bookPNo", "==", removeAllNonAlphaNumericCharacters(bookNo)],
        ]);
        if (bSnap) {
          let bItem = {};
          bSnap.forEach((doc) => {
            bItem = { ...doc.data(), _id: doc.id };
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
        let referrerName = `${referrer?.prefix || ""}${
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

exports.updateReportSaleParts = functions
  .region("asia-northeast1")
  .firestore.document("/sections/sales/partGroups/{saleId}")
  .onCreate(async (snap, context) => {
    try {
      let reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("parts");
      await reportRef.doc(context.params.saleId).set(snap.data());
    } catch (e) {
      error(e);
    }
  });

exports.updateReportService = functions
  .region("asia-northeast1")
  .firestore.document("/sections/services/importServices/{serviceId}")
  .onCreate(async (snap, context) => {
    try {
      let reportRef = firestore
        .collection("reports")
        .doc("services")
        .collection("all");
      await reportRef.doc(context.params.serviceId).set(snap.data());
    } catch (e) {
      error(e);
    }
  });

exports.updateBookingOrder = functions
  .region("asia-northeast1")
  .firestore.document("/sections/sales/bookings/{bookId}")
  .onCreate(async (snap, context) => {
    try {
      let reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("assessment");

      let order = snap.data();
      let newValues = formatAssessmentData(order);
      let doc = cleanValuesBeforeSave(newValues);

      // createReportSaleAssessment
      await reportRef.doc(context.params.bookId).set(doc);

      if (!!order?.items && order.items.length > 0) {
        // Update stock.
        let reserved = {
          bookId: order.bookId || null,
          bookNo: order.bookNo || null,
          saleType: order.saleType || null,
          customerId: order.customerId || null,
          customer: order.customer || null,
          ts: order.created || null,
          by: order.salesPerson || [],
        };

        let transaction = [
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

        await arrayForEach(order.items, async (item) => {
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            let vNoArr = convertToArray(item.vehicleNo);
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
                let vItem = {};
                vSnap.forEach((doc) => {
                  vItem = { ...doc.data(), _id: doc.id };
                });
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).update({
                    reserved,
                    transactions: vItem?.transactions
                      ? vItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            let pNoArr = Array.isArray(item.peripheralNo)
              ? item.peripheralNo
              : item.peripheralNo.split(",");
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
                let pItem = {};
                pSnap.forEach((doc) => {
                  pItem = { ...doc.data(), _id: doc.id };
                });
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).update({
                    reserved,
                    transactions: pItem?.transactions
                      ? pItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else {
            // Check FIFO
            let fSnap = await getCollection(
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
              let fItems = [];
              fSnap.forEach((doc) => {
                if (!doc.data()?.exported) {
                  fItems.push({ ...doc.data(), _id: doc.id });
                }
              });
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).update({
                  reserved,
                  transactions: fItems[0]?.transactions
                    ? fItems[0].transactions.concat(transaction)
                    : transaction,
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

exports.updateBookingOrderChange = functions
  .region("asia-northeast1")
  .firestore.document("/sections/sales/bookings/{bookId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      let reportRef = firestore
        .collection("reports")
        .doc("sales")
        .collection("assessment");
      // log('change', after);
      const prev = before?.assessment || {};
      const cur = after?.assessment || {};
      const prevCustomerId = before?.customerId;
      const curCustomerId = after?.customerId;
      // log({ prev, cur });
      if (!deepEqual(prev, cur) || curCustomerId != prevCustomerId) {
        let newValues = formatAssessmentData(after);
        newValues = cleanValuesBeforeSave(newValues);
        log({ prev, cur, newValues });
        await reportRef.doc(context.params.bookId).set(newValues);
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateTransfer = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/transfer/{transferId}")
  .onCreate(async (snap, context) => {
    // Check stock existing, update product transfer data.
    try {
      let updateItemsRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("transferItems");
      let transferRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("transfer");

      let order = snap.data();

      let docNo_lower = order.docNo.toLowerCase();
      let key1 = createKeywords(docNo_lower);
      let key2 = createKeywords(
        removeAllNonAlphaNumericCharacters(docNo_lower)
      );
      let keywords = _.uniq([...key1, ...key2]);
      let transferId = context.params.transferId;
      await transferRef.doc(transferId).update({
        keywords,
      });

      if (order.items) {
        await arrayForEach(order.items, async (item) => {
          let vNoArr = convertToArray(item.vehicleNo);
          let isVehicle = item?.productName
            ? checkIsVehicleFromName(item.productName)
            : vNoArr.length > 0;
          let model = isVehicle
            ? getModelFromName(item.productName)
            : extractPeripheralModel(item.peripheralNo);
          if (model.length < 3) {
            model = getModelFromName(item.productName);
          }
          // Add detail to item.
          await updateItemsRef.doc(item.transferItemId).set({
            ...item,
            exportDate: order.exportDate,
            docNo: order.docNo,
            docNo_lower,
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
          let transfer = {
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
            let vNoArr = convertToArray(item.vehicleNo);
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
                let vItem = {};
                vSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === order.fromOrigin &&
                    !doc.data().transfer
                  ) {
                    // Vehicle is in stocks.
                    vItem = { ...doc.data(), _id: doc.id };
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
            let pNoArr = convertToArray(item.peripheralNo);
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
                let pItem = {};
                pSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === order.fromOrigin &&
                    !doc.data().transfer
                  ) {
                    // Peripheral is in stocks.
                    pItem = { ...doc.data(), _id: doc.id };
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
            let fSnap = await getCollection(
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
              let fItems = [];
              fSnap.forEach((doc) => {
                if (
                  !!doc.data()?.branchCode &&
                  doc.data().branchCode === order.fromOrigin &&
                  !doc.data().transfer
                ) {
                  // Product is in stocks.
                  fItems.push({ ...doc.data(), _id: doc.id });
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

exports.updateTransferChange = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/transfer/{transferId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      let updateItemsRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("transferItems");

      if (!before.deleted && after.deleted) {
        // Transfer document is deleted.
        if (after.items) {
          let mItems = after.items;
          // Update deleted to items.
          mItems = mItems.map((l) => ({ ...l, deleted: after.deleted }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
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
          mItems = mItems.map((l) => ({ ...l, cancelled: after.cancelled }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
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
          mItems = mItems.map((l) => ({ ...l, rejected: after.rejected }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
            await updateItemsRef.doc(item.transferItemId).update({
              rejected: after.rejected,
            });
          });
        }
      }
      if (!before.completed && after.completed) {
        // Trasfer is completed.
        // Update stock item's branch.
        let mItems = after.items;
        let transaction = [
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
        await arrayForEach(mItems, async (item) => {
          log("item", JSON.stringify(item));
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            let vNoArr = convertToArray(item.vehicleNo);
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
                let vItem = {};
                vSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === after.fromOrigin
                  ) {
                    // Vehicle is in stocks.
                    vItem = { ...doc.data(), _id: doc.id };
                  }
                });
                // Update new branch, transactions history, and clear stock transfer data.
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).update({
                    transfer: null,
                    branchCode: after.toDestination,
                    transactions: vItem?.transactions
                      ? vItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            log("peripheralNo", item?.peripheralNo);
            let pNoArr = convertToArray(item.peripheralNo);
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
                let pItem = {};
                pSnap.forEach((doc) => {
                  if (
                    !!doc.data()?.branchCode &&
                    doc.data().branchCode === after.fromOrigin
                  ) {
                    // Peripheral is in stocks.
                    pItem = { ...doc.data(), _id: doc.id };
                  }
                });
                log("*** Peripheral stock found ***", pItem);
                // Update new branch, transactions history, and clear stock transfer data.
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).update({
                    transfer: null,
                    branchCode: after.toDestination,
                    transactions: pItem?.transactions
                      ? pItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else {
            // If the product has no vehicle number and peripheral number, Check FIFO
            let fSnap = await getCollection(
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
              // Product is found in stock.
              let fItems = [];
              fSnap.forEach((doc) => {
                if (
                  !!doc.data()?.branchCode &&
                  doc.data().branchCode === after.fromOrigin
                ) {
                  // Product is in stocks.
                  fItems.push({ ...doc.data(), _id: doc.id });
                }
              });
              // Update new branch, transactions history, and clear stock transfer data.
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).update({
                  transfer: null,
                  branchCode: after.toDestination,
                  transactions: fItems[0]?.transactions
                    ? fItems[0].transactions.concat(transaction)
                    : transaction,
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
    } catch (e) {
      error(e);
    }
  });

exports.updateSaleOut = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/saleOut/{deliverId}")
  .onCreate(async (snap, context) => {
    try {
      let customersRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");

      let order = snap.data();
      let customer;
      if (!!order.receivedBy && !!order.receivedDate && !!order.items) {
        if (order.saleId) {
          // Update inventory recorded on sale.
          let sSnap = await getCollection(
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
        let saleType = order.saleType || null;
        if (order.items) {
          let cDoc = await getDoc(
            firestore,
            "data",
            `sales/customers/${order.customerId}`
          );
          if (cDoc) {
            customer = cDoc.data();
          }
          // Update stock item's sold out.
          let transaction = [
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
          let sold = {
            deliverId: order?.deliverId || null,
            saleId: order.saleId || null,
            saleNo: order.saleNo || null,
            saleType: order.saleType || null,
            customerId: order.customerId || null,
            customer: order.customer || null,
            ts: order.created || null,
            by: order.salesPerson || [],
          };
          let owner = [
            {
              customer: order.customer,
              customerId: order.customerId,
              date: order.date,
            },
          ];
          await arrayForEach(order.items, async (item) => {
            let saleVehicle = [
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
              let vNoArr = convertToArray(item.vehicleNo);
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
                  let vItem = {};
                  vSnap.forEach((doc) => {
                    if (!doc.data()?.sold) {
                      vItem = { ...doc.data(), _id: doc.id };
                    }
                  });
                  !!vItem?._id &&
                    (await vehicleStockRef.doc(vItem._id).update({
                      sold,
                      baac: saleType === "baac" || null,
                      skl: saleType === "sklLeasing" || null,
                      kbnLeasing: saleType === "kbnLeasing" || null,
                      transactions: vItem?.transactions
                        ? vItem.transactions.concat(transaction)
                        : transaction,
                      owner: vItem?.owner ? vItem.owner.concat(owner) : owner,
                    }));
                  // Update customer ownership.
                  if (customer) {
                    !!order?.customerId &&
                      (await customersRef.doc(order.customerId).update({
                        vehicles: customer?.vehicles
                          ? customer.vehicles.concat(saleVehicle)
                          : saleVehicle,
                      }));
                  }
                }
              }
            } else if (hasPNo) {
              let pNoArr = convertToArray(item.peripheralNo);
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
                  let pItem = {};
                  pSnap.forEach((doc) => {
                    if (!doc.data()?.sold) {
                      pItem = { ...doc.data(), _id: doc.id };
                    }
                  });
                  !!pItem?._id &&
                    (await vehicleStockRef.doc(pItem._id).update({
                      sold,
                      baac: saleType === "baac" || null,
                      skl: saleType === "sklLeasing" || null,
                      kbnLeasing: saleType === "kbnLeasing" || null,
                      transactions: pItem?.transactions
                        ? pItem.transactions.concat(transaction)
                        : transaction,
                    }));
                }
              }
            } else {
              // Check FIFO.
              let fSnap = await getCollection(
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
                let fItems = [];
                fSnap.forEach((doc) => {
                  if (!doc.data()?.sold) {
                    fItems.push({ ...doc.data(), _id: doc.id });
                  }
                });
                fItems[0]?._id &&
                  (await vehicleStockRef.doc(fItems[0]._id).update({
                    sold,
                    baac: saleType === "baac" || null,
                    skl: saleType === "sklLeasing" || null,
                    kbnLeasing: saleType === "kbnLeasing" || null,
                    transactions: fItems[0]?.transactions
                      ? fItems[0].transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
            return item;
          });
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateSaleOutChange = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/saleOut/{deliverId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      let updateItemsRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("saleOutItems");
      let customersRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");

      if (!before.deleted && after.deleted) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, deleted: after.deleted }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
            await updateItemsRef.doc(item.deliverItemId).update({
              deleted: after.deleted,
            });
          });
        }
      }
      if (!before.cancelled && after.cancelled) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, cancelled: after.cancelled }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
            await updateItemsRef.doc(item.deliverItemId).update({
              cancelled: after.cancelled,
            });
          });
        }
      }
      if (!before.rejected && after.rejected) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, rejected: after.rejected }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
            await updateItemsRef.doc(item.deliverItemId).update({
              rejected: after.rejected,
            });
          });
        }
      }
      if (!before.completed && after.completed && !!after?.items) {
        if (after.saleId) {
          // Update inventory recorded on sale.
          let sSnap = await getCollection(
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
        let saleType = after.saleType || null;
        if (after.items) {
          let customer;
          let cDoc = await getDoc(
            firestore,
            "data",
            `sales/customers/${after.customerId}`
          );
          if (cDoc) {
            customer = cDoc.data();
          }
          // Update stock item's sold out.
          let mItems = after.items;
          let transaction = [
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
          let sold = {
            deliverId: after?.deliverId || null,
            saleId: after.saleId || null,
            saleNo: after.saleNo || null,
            saleType: after.saleType || null,
            customerId: after.customerId || null,
            customer: after.customer || null,
            ts: after.created || null,
            by: after.salesPerson || [],
          };
          let owner = [
            {
              customer: after.customer,
              customerId: after.customerId,
              date: after.date,
            },
          ];
          await arrayForEach(mItems, async (item) => {
            let saleVehicle = [
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
              let vNoArr = convertToArray(item.vehicleNo);
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
                  let vItem = {};
                  vSnap.forEach((doc) => {
                    if (!doc.data()?.sold) {
                      // In stocks.
                      vItem = { ...doc.data(), _id: doc.id };
                    }
                  });
                  !!vItem?._id &&
                    (await vehicleStockRef.doc(vItem._id).update({
                      sold,
                      baac: saleType === "baac" || null,
                      skl: saleType === "sklLeasing" || null,
                      kbnLeasing: saleType === "kbnLeasing" || null,
                      transactions: vItem?.transactions
                        ? vItem.transactions.concat(transaction)
                        : transaction,
                      owner: vItem?.owner ? vItem.owner.concat(owner) : owner,
                    }));
                  // Update customer ownership.
                  if (customer) {
                    await customersRef.doc(after.customerId).set({
                      ...customer,
                      vehicles: customer?.vehicles
                        ? customer.vehicles.concat(saleVehicle)
                        : saleVehicle,
                    });
                  }
                }
              }
            } else if (hasPNo) {
              let pNoArr = convertToArray(item.peripheralNo);
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
                  let pItem = {};
                  pSnap.forEach((doc) => {
                    if (!doc.data()?.sold) {
                      // In stocks.
                      pItem = { ...doc.data(), _id: doc.id };
                    }
                  });
                  !!pItem?._id &&
                    (await vehicleStockRef.doc(pItem._id).update({
                      sold,
                      baac: saleType === "baac" || null,
                      skl: saleType === "sklLeasing" || null,
                      kbnLeasing: saleType === "kbnLeasing" || null,
                      transactions: pItem?.transactions
                        ? pItem.transactions.concat(transaction)
                        : transaction,
                    }));
                }
              }
            } else {
              // Check FIFO
              let fSnap = await getCollection(
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
                let fItems = [];
                fSnap.forEach((doc) => {
                  if (!doc.data()?.sold) {
                    // In stocks.
                    fItems.push({ ...doc.data(), _id: doc.id });
                  }
                });
                fItems[0]?._id &&
                  (await vehicleStockRef.doc(fItems[0]._id).update({
                    sold,
                    baac: saleType === "baac" || null,
                    skl: saleType === "sklLeasing" || null,
                    kbnLeasing: saleType === "kbnLeasing" || null,
                    transactions: fItems[0]?.transactions
                      ? fItems[0].transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
            return item;
          });
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateOtherVehicleOut = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/otherVehicleOut/{exportId}")
  .onCreate(async (snap, context) => {
    try {
      let order = snap.data();
      let customer;
      let transaction = [
        {
          ts: order.created || null,
          by: order.recordedBy || null,
          type: "export",
          info: `เอกสารเลขที่: ${order.docNo} ปลายทาง: ${order.destination}`,
          docId: order?.exportId || null,
          docNo: order.docNo || null,
        },
      ];
      let exported = {
        exportId: order?.exportId || null,
        docNo: order.docNo || null,
        ts: order.created || null,
        by: order.recordedBy || null,
        destination: order?.destination || null,
      };
      if (!!order.receivedBy && !!order.receivedDate && !!order.items) {
        // Update stock item's exported.
        await arrayForEach(order.items, async (item) => {
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            let vNoArr = convertToArray(item.vehicleNo);
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
                let vItem = {};
                vSnap.forEach((doc) => {
                  if (!doc.data()?.exported) {
                    vItem = { ...doc.data(), _id: doc.id };
                  }
                });
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).set({
                    ...vItem,
                    exported,
                    transactions: vItem?.transactions
                      ? vItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            let pNoArr = convertToArray(item.peripheralNo);
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
                let pItem = {};
                pSnap.forEach((doc) => {
                  if (!doc.data()?.exported) {
                    pItem = { ...doc.data(), _id: doc.id };
                  }
                });
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).set({
                    ...pItem,
                    exported,
                    transactions: pItem?.transactions
                      ? pItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else {
            // Check FIFO
            let fSnap = await getCollection(
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
              let fItems = [];
              fSnap.forEach((doc) => {
                if (!doc.data()?.exported) {
                  fItems.push({ ...doc.data(), _id: doc.id });
                }
              });
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).set({
                  ...fItems[0],
                  exported,
                  transactions: fItems[0]?.transactions
                    ? fItems[0].transactions.concat(transaction)
                    : transaction,
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

exports.updateOtherVehicleOutChange = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/otherVehicleOut/{exportId}")
  .onUpdate(async (change, context) => {
    try {
      if (onlyCreatedAtChanged(change.before.data(), change.after.data())) {
        return null;
      }
      const after = change.after.data();
      const before = change.before.data();
      let peripheralStockRef = firestore
        .collection("sections")
        .doc("stocks")
        .collection("peripherals");
      let customersRef = firestore
        .collection("data")
        .doc("sales")
        .collection("customers");

      if (!before.deleted && after.deleted) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, deleted: after.deleted }));
          await change.after.ref.update({ items: mItems });
        }
      }
      if (!before.cancelled && after.cancelled) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, cancelled: after.cancelled }));
          await change.after.ref.update({ items: mItems });
        }
      }
      if (!before.rejected && after.rejected) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, rejected: after.rejected }));
          await change.after.ref.update({ items: mItems });
        }
      }
      if (!before.completed && after.completed && !!after?.items) {
        // Update stock item's sold out.
        let mItems = after.items;
        let transaction = [
          {
            ts: after.created || null,
            by: after.recordedBy || null,
            type: "saleOut",
            info: `เอกสารเลขที่: ${after.docNo} ปลายทาง: ${after.destination}`,
            docId: after?.exportId || null,
          },
        ];
        let exported = {
          exportId: after?.exportId || null,
          docNo: after?.docNo || null,
          ts: after.created || null,
          by: after.recordedBy || null,
          destination: after.destination || null,
        };
        await arrayForEach(mItems, async (item) => {
          const hasVNo = hasVehicleNo(item);
          const hasPNo = hasPeripheralNo(item);
          if (hasVNo) {
            let vNoArr = convertToArray(item.vehicleNo);
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
                let vItem = {};
                vSnap.forEach((doc) => {
                  vItem = { ...doc.data(), _id: doc.id };
                });
                !!vItem?._id &&
                  (await vehicleStockRef.doc(vItem._id).set({
                    ...vItem,
                    exported,
                    transactions: vItem?.transactions
                      ? vItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else if (hasPNo) {
            let pNoArr = Array.isArray(item.peripheralNo)
              ? item.peripheralNo
              : item.peripheralNo.split(",");
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
                let pItem = {};
                pSnap.forEach((doc) => {
                  pItem = { ...doc.data(), _id: doc.id };
                });
                !!pItem?._id &&
                  (await vehicleStockRef.doc(pItem._id).set({
                    ...pItem,
                    exported,
                    transactions: pItem?.transactions
                      ? pItem.transactions.concat(transaction)
                      : transaction,
                  }));
              }
            }
          } else {
            // Check FIFO
            let fSnap = await getCollection(
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
              let fItems = [];
              fSnap.forEach((doc) => {
                if (!doc.data()?.exported) {
                  fItems.push({ ...doc.data(), _id: doc.id });
                }
              });
              !!fItems[0]?._id &&
                (await vehicleStockRef.doc(fItems[0]._id).set({
                  ...fItems[0],
                  exported,
                  transactions: fItems[0]?.transactions
                    ? fItems[0].transactions.concat(transaction)
                    : transaction,
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

exports.updateOtherVehicleImport = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/otherVehicleIn/{importId}")
  .onCreate(async (snap, context) => {
    try {
      const newVehicle = snap.data();
      const {
        importDate,
        importId,
        docNo,
        origin,
        created,
        receivedBy,
        toDestination,
        deliveredBy,
        // deliveredDate,
        // recordedBy,
        // recordedDate,
        // verifiedBy,
        // verifiedDate,
        // approvedBy,
        // approvedDate,
        // receivedDate,
        // remark,
        saleId,
        saleNo,
        customerId,
        customer,
        isUsed,
        subType,
        items,
      } = snap.data();
      let vehicleStock = [];

      if (items) {
        await arrayForEach(items, async (item) => {
          let productName = item?.productName || null;
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

            let vNo = vNoArr.length > 0 ? vNoArr[i] || "" : "";
            let pNo = pNoArr.length > 0 ? pNoArr[i] || "" : "";
            let eNo = eNoArr.length > 0 ? eNoArr[i] || "" : "";

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

            let isVehicle = productName
              ? checkIsVehicleFromName(productName)
              : vNoArr.length > 0;

            let model = isVehicle
              ? getModelFromName(productName)
              : extractPeripheralModel(peripheralNo);
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
              productType: isVehicle
                ? !!item?.productCode && item.productCode.startsWith("2-")
                  ? "รถมือสอง"
                  : "รถใหม่"
                : !!item?.productCode && item.productCode.startsWith("2-")
                ? "อุปกรณ์มือสอง"
                : "อุปกรณ์ใหม่",
              isVehicle,
              isFIFO: !item?.vehicleNo && !item?.peripheralNo,
              isUsed,
              engineNo,
              vehicleNo_lower: vehicleNo.toLowerCase(),
              vehicleNo_partial: partialText(vehicleNo),
              keywords: isVehicle
                ? createVehicleNoKeyWords(vehicleNo)
                : createPeripheralNoKeyWords(peripheralNo),
              productPCode: item?.productCode
                ? removeAllNonAlphaNumericCharacters(item.productCode)
                : null,
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
                  ...(!!saleId && { saleId }),
                  ...(!!saleNo && { saleNo }),
                  ...(!!customerId && { customerId }),
                  ...(!!customer && { customer }),
                  deliveredBy,
                },
              }),
              peripheralNo_lower: peripheralNo.toLowerCase(),
              peripheralNo_partial: partialText(peripheralNo),
              transactions: [
                {
                  ts: created,
                  by: receivedBy,
                  type: "importOther",
                  ...(!!subType && { subType }),
                  ...(!!item?.batchNo && { info: `BatchNo: ${item.batchNo}` }),
                  docNo,
                  origin,
                  importDate: importDate || null,
                  docId: importId,
                  ...(!!customerId && { customerId }),
                  ...(!!customer && { customer }),
                },
              ],
            });
          }
          return item;
        });
      }

      // Add inventory
      await arrayForEach(vehicleStock, async (vItem, i) => {
        let vId = vItem?.isVehicle
          ? vItem.vehicleNoFull
          : vItem.peripheralNoFull;
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

exports.updateDecal = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/decal/{docId}")
  .onCreate(async (snap, context) => {
    try {
      const {
        vehicleNo,
        engineNo,
        docNo,
        date,
        decalRecordedDate,
        recordedBy,
        decalWithdrawDate,
        picker,
        isDecal,
        isTakeOut,
        isUsed,
        urlChassis,
        urlEngine,
      } = snap.data();

      let vNo = cleanIdentityNumber(vehicleNo);
      let docId = context.params.docId;

      let decal = {
        date,
        decalRecordedDate,
        recordedBy,
        decalWithdrawDate,
        isDecal,
        urlChassis,
        urlEngine,
        docId,
        docNo,
      };

      let transaction = [
        {
          ts: snap.data()?.created || null,
          by: recordedBy || null,
          type: "decal",
          docId,
          docNo,
          docDate: decalRecordedDate,
          isDecal,
          isTakeOut,
        },
      ];

      let vSnap = await getCollection(firestore, "sections/stocks/vehicles", [
        ["vehicleNo", "==", vNo],
      ]);
      if (vSnap) {
        let vItem = {};
        vSnap.forEach((doc) => {
          vItem = { ...doc.data(), _id: doc.id };
        });
        !!vItem?._id &&
          (await vehicleStockRef.doc(vItem._id).update({
            decal,
            transactions: vItem?.transactions
              ? vItem.transactions.concat(transaction)
              : transaction,
            ...(!!engineNo && { engineNo }),
            ...(!!urlChassis && { urlChassis }),
            ...(!!urlEngine && { urlEngine }),
          }));
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateDecalChange = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/decal/{docId}")
  .onUpdate(async (change, context) => {
    try {
      const after = change.after.data();
      const before = change.before.data();

      if (!before.isTakeOut && after.isTakeOut) {
        const {
          vehicleNo,
          docNo,
          date,
          decalRecordedDate,
          recordedBy,
          decalWithdrawDate,
          picker,
          isDecal,
          isTakeOut,
          isUsed,
          urlChassis,
          urlEngine,
        } = after;

        let vNo = cleanIdentityNumber(vehicleNo);
        let docId = context.params.docId;

        let decalTaken = {
          decalWithdrawDate,
          picker,
          isDecal,
          isTakeOut,
          urlChassis,
          urlEngine,
          docId,
          docNo,
        };

        let transaction = [
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

        let vSnap = await getCollection(firestore, "sections/stocks/vehicles", [
          ["vehicleNo", "==", vNo],
        ]);
        if (vSnap) {
          let vItem = {};
          vSnap.forEach((doc) => {
            vItem = { ...doc.data(), _id: doc.id };
          });
          !!vItem?._id &&
            (await vehicleStockRef.doc(vItem._id).update({
              decalTaken,
              transactions: vItem?.transactions
                ? vItem.transactions.concat(transaction)
                : transaction,
            }));
        }
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateDeliveryPlan = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/deliver/{deliverId}")
  .onCreate(async (snap, context) => {
    try {
      let order = snap.data();
      if (order.items) {
        await arrayForEach(order.items, async (item) => {
          let isVehicle = item?.productName
            ? checkIsVehicleFromName(item.productName)
            : item?.vNoArr && item.vNoArr.length > 0;
          let model = isVehicle
            ? getModelFromName(item.productName)
            : extractPeripheralModel(item.peripheralNo);
          if (model.length < 3) {
            model = getModelFromName(item.productName);
          }
          let deliverItem = {
            ...item,
            date: order.date,
            branchCode: order.branchCode,
            docNo: order.docNo,
            docNo_lower: order.docNo.toLowerCase(),
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

exports.updateDeliveryPlanChange = functions
  .region("asia-northeast1")
  .firestore.document("/sections/stocks/deliver/{deliverId}")
  .onUpdate(async (change, context) => {
    try {
      const after = change.after.data();
      const before = change.before.data();

      if (!before.deleted && after.deleted) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, deleted: after.deleted }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
            await deliverItemsRef.doc(item.deliverItemId).update({
              deleted: after.deleted,
            });
          });
        }
      }
      if (!before.cancelled && after.cancelled) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, cancelled: after.cancelled }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
            await deliverItemsRef.doc(item.deliverItemId).update({
              cancelled: after.cancelled,
            });
          });
        }
      }
      if (!before.rejected && after.rejected) {
        if (after.items) {
          let mItems = after.items;
          mItems = mItems.map((l) => ({ ...l, rejected: after.rejected }));
          await change.after.ref.update({ items: mItems });
          await arrayForEach(after.items, async (item) => {
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

exports.updateAccountIncome = functions
  .region("asia-northeast1")
  .firestore.document("/sections/account/incomes/{incomeId}")
  .onCreate(async (snap, context) => {
    try {
      let incomeRef = firestore
        .collection("sections")
        .doc("account")
        .collection("incomes");
      const { payments } = snap.data();
      let hasBankTransfer =
        !!payments &&
        Array.isArray(payments) &&
        payments.filter(
          (l) => l.paymentType === "transfer" && Number(l.amount) > 0
        ).length > 0;

      let hasPLoan =
        !!payments &&
        Array.isArray(payments) &&
        payments.filter(
          (l) => l.paymentType === "pLoan" && Number(l.amount) > 0
        ).length > 0;

      await incomeRef
        .doc(context.params.incomeId)
        .update({ hasBankTransfer, hasPLoan });

      if (hasPLoan) {
        await incomeRef
          .doc(context.params.incomeId)
          .update({ pLoanPayments: [] });
      }
    } catch (e) {
      error(e);
    }
  });

exports.updateAccountExpense = functions
  .region("asia-northeast1")
  .firestore.document("/sections/account/expenses/{expenseId}")
  .onCreate(async (snap, context) => {
    try {
      let expenseRef = firestore
        .collection("sections")
        .doc("account")
        .collection("expenses");
      let snapshot = snap.data();
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
      const newValues = { ...snapshot, isPart };
      await expenseRef.doc(context.params.expenseId).set(newValues);
    } catch (e) {
      error("ERROR_UPDATE_ACCOUNT_EXPENSE ", e);
      error("SNAPSHOT: ", JSON.stringify(snap.data(), null, 2));
    }
  });

exports.onHRLeaveCreate = functions
  .region("asia-northeast1")
  .firestore.document("/sections/hr/leave/{docId}")
  .onCreate(async (snap, context) => {
    try {
      let snapshot = snap.data();
      const { fromDate, toDate } = snapshot;
      // Get array of dates.
      const dates = getDates(fromDate, toDate, "YYYY-MM-DD");
      const newValues = { ...snapshot, dates };

      let updateRef = firestore
        .collection("sections")
        .doc("hr")
        .collection("leave")
        .doc(context.params.docId);
      await updateRef.set(newValues);
    } catch (e) {
      error(e);
    }
  });

exports.updateHRLeave = functions
  .region("asia-northeast1")
  .firestore.document("/sections/hr/leave/{docId}")
  .onUpdate(async (change, context) => {
    try {
      const after = change.after.data();
      const before = change.before.data();
      const docId = context.params.docId;
      const beforeFromDate = before.fromDate;
      const beforeToDate = before.toDate;
      const afterFromDate = after.fromDate;
      const afterToDate = after.toDate;

      if (beforeFromDate !== afterFromDate || beforeToDate !== afterToDate) {
        const { fromDate, toDate } = after;
        // Get array of dates.
        const dates = getDates(fromDate, toDate, "YYYY-MM-DD");

        let updateRef = firestore
          .collection("sections")
          .doc("hr")
          .collection("leave")
          .doc(docId);
        await updateRef.update({ dates });
      }
    } catch (e) {
      error(e);
    }
  });
