import { distinctArr, sortArr, sortArrByMultiKeys } from 'functions';

export const getBillOptions = (data, keys) => {
  let dBillArr = distinctArr(data, keys);
  if (keys.length > 1) {
    dBillArr = sortArrByMultiKeys(dBillArr, keys);
  } else {
    dBillArr = sortArr(dBillArr, keys[0]);
  }
  const billOptions = dBillArr.map((it, ind) => ({
    value: it.receiveNo || it.billNoSKC,
    label: it.receiveNo || it.billNoSKC
  }));
  return billOptions;
};

export const getVpNumOptions = (data, keys) => {
  let VPNumArr = sortArrByMultiKeys(data, keys);
  const VpNumOptions = VPNumArr.map((it, ind) => ({
    value: it.key,
    label: it.vehicleNo && it.peripheralNo ? `${it.vehicleNo} / ${it.peripheralNo}` : it.vehicleNo || it.peripheralNo
  }));
  return VpNumOptions;
};

export const getPoOptions = (data, keys) => {
  let dPO_Arr = distinctArr(data, keys);
  dPO_Arr = sortArr(dPO_Arr, keys[0]);

  const PO_Options = dPO_Arr.map((it, ind) => ({
    value: it.purchaseNo,
    label: it.purchaseNo
  }));
  return PO_Options;
};
