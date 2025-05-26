/**
 * @typedef {import('dayjs').Dayjs} Dayjs
 * @typedef {import('firebase/firestore').DocumentData} DocumentData
 * @typedef {import('components/Table/types').TableData} TableData
 */

/**
 * @typedef {Object} InputPriceItem
 * @property {number} id - Item ID
 * @property {string} key - Unique key
 * @property {string} productCode - Product code
 * @property {string} productName - Product name
 * @property {string[]} vehicleNo - Vehicle numbers
 * @property {string[]|string} peripheralNo - Peripheral numbers
 * @property {string[]} engineNo - Engine numbers
 * @property {string|null} productType - Product type
 * @property {string} detail - Item details
 * @property {number} unitPrice - Unit price
 * @property {number} qty - Quantity
 * @property {number} total - Total amount
 * @property {string} status - Item status
 * @property {string} _key - Internal key
 * @property {string} [itemId] - Optional item ID
 * @property {string} [docId] - Optional document ID
 * @property {string} [storeLocationCode] - Optional store location code
 * @property {string} [unit] - Optional unit
 * @property {number} [discount] - Optional discount
 * @property {string} [billNoSKC] - Optional bill number
 * @property {string} [branch] - Optional branch
 * @property {string} [branchCode] - Optional branch code
 * @property {string} [docDate] - Optional document date
 * @property {string} [docNo] - Optional document number
 * @property {string} [invoiceDate] - Optional invoice date
 * @property {string} [priceType] - Optional price type
 * @property {string} [purchaseNo] - Optional purchase number
 * @property {string} [seller] - Optional seller
 * @property {number} [startBalance] - Optional start balance
 * @property {boolean} [warehouseChecked] - Optional warehouse check status
 * @property {string} [warehouseCheckedBy] - Optional warehouse checker
 * @property {string} [warehouseCheckedDate] - Optional warehouse check date
 * @property {string} [warehouseInputBy] - Optional warehouse inputter
 * @property {string} [warehouseReceiveDate] - Optional warehouse receive date
 * @property {number} [creditTerm] - Optional credit term
 * @property {number} [unitPrice_original] - Optional original unit price
 * @property {boolean} [deleted] - Optional deletion status
 * @property {number} [import] - Optional import value
 * @property {string} [importTime] - Optional import time
 * @property {string} [inputDate] - Optional input date
 * @property {string} [receiveNo] - Optional receive number
 */

/**
 * @typedef {Object} InputPriceFormValues
 * @property {string} billNoSKC - Bill number
 * @property {string} taxInvoiceNo - Tax invoice number
 * @property {string|Dayjs} taxInvoiceDate - Tax invoice date
 * @property {string} taxFiledPeriod - Tax filed period
 * @property {number} creditDays - Credit days
 * @property {string|Dayjs} dueDate - Due date
 * @property {string} priceType - Price type
 * @property {string} [remark] - Optional remarks
 * @property {number} [billDiscount] - Optional bill discount
 * @property {number} [deductDeposit] - Optional deposit deduction
 * @property {boolean} [transferCompleted] - Optional transfer completion status
 * @property {InputPriceItem[]} items - Input price items
 * @property {Array<any>} [auditTrail] - Optional audit trail
 * @property {Array<{status: string, time: number, uid: string, userInfo: {name: string, email: string, department?: string, role?: string}}>} [statusHistory] - Optional status history
 * @property {('draft'|'reviewed'|'approved'|'rejected')} [status] - Optional status
 */

/**
 * @typedef {Object} InputPriceState
 * @property {string|null} mReceiveNo - Receive number
 * @property {boolean} noItemUpdated - Item update status
 * @property {number|null} deductDeposit - Deposit deduction
 * @property {number|null} billDiscount - Bill discount
 * @property {string|null} priceType - Price type
 * @property {number|null} total - Total amount
 */

/**
 * @typedef {Object} InputPriceProps
 * @property {boolean} [grant] - Optional grant flag
 * @property {boolean} [readOnly] - Optional read-only flag
 * @property {string} provinceId - Province ID
 * @property {string} departmentId - Department ID
 */

/**
 * @typedef {Object} RenderSummaryProps
 * @property {number} total - Total amount
 * @property {number} afterDiscount - Amount after discount
 * @property {number} afterDepositDeduct - Amount after deposit deduction
 * @property {number} billVAT - Bill VAT
 * @property {number} billTotal - Bill total
 * @property {function(number|null): void} onBillDiscountChange - Bill discount change handler
 * @property {function(number|null): void} onDeductDepositChange - Deposit deduction change handler
 */

export {};
