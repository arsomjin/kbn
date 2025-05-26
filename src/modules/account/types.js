/**
 * @typedef {import('dayjs').Dayjs} Dayjs
 */

/**
 * @typedef {Object} FinancialDataPoint
 * @property {Dayjs} date - The date of the financial data point
 * @property {number} income - The income amount
 * @property {number} expense - The expense amount
 * @property {number} balance - The balance amount
 */

/**
 * @typedef {Object} AccountIncomeRecord
 * @property {string} id - Unique identifier
 * @property {string} accountId - Account identifier
 * @property {string} [saleId] - Optional sale identifier
 * @property {('vehicle'|'service'|'parts'|'other')} incomeCategory - Category of income
 * @property {number} amount - Income amount
 * @property {number} date - Timestamp of the income
 * @property {string} provinceId - Province identifier
 * @property {number} created - Creation timestamp
 * @property {string} createdBy - Creator's identifier
 * @property {('pending'|'approved'|'rejected')} status - Status of the income record
 * @property {string} [approvedBy] - Optional approver's identifier
 * @property {number} [approvedAt] - Optional approval timestamp
 * @property {string} [notes] - Optional notes
 */

/**
 * @typedef {Object} AccountExpenseRecord
 * @property {string} id - Unique identifier
 * @property {string} accountId - Account identifier
 * @property {('vehicle'|'service'|'parts'|'other')} expenseType - Type of expense
 * @property {number} amount - Expense amount
 * @property {number} date - Timestamp of the expense
 * @property {string} provinceId - Province identifier
 * @property {number} created - Creation timestamp
 * @property {string} createdBy - Creator's identifier
 * @property {('pending'|'approved'|'rejected')} status - Status of the expense record
 * @property {string} [approvedBy] - Optional approver's identifier
 * @property {number} [approvedAt] - Optional approval timestamp
 * @property {string} [notes] - Optional notes
 */

/**
 * @typedef {Object} AccountOverviewData
 * @property {FinancialDataPoint[]} data - Array of financial data points
 * @property {number} totalIncome - Total income amount
 * @property {number} totalExpense - Total expense amount
 * @property {number} netBalance - Net balance amount
 */

/**
 * @typedef {Object} AccountReportProps
 * @property {string} title - Report title
 * @property {string} branchName - Branch name
 * @property {[Dayjs, Dayjs]} range - Date range
 * @property {function([Dayjs, Dayjs]): void} onRangeChange - Range change handler
 * @property {AccountOverviewData} data - Overview data
 */

/**
 * @typedef {Object} AccountPieChartProps
 * @property {string} title - Chart title
 * @property {string} branchName - Branch name
 * @property {[Dayjs, Dayjs]} range - Date range
 * @property {AccountOverviewData} data - Overview data
 */

/**
 * @typedef {Object} AccountTableProps
 * @property {FinancialDataPoint[]} data - Financial data points
 * @property {[Dayjs, Dayjs]} range - Date range
 */

/**
 * @typedef {Object} UseFinancialDataReturn
 * @property {function(string, string): Promise<FinancialDataPoint[]>} getFinancialData - Function to get financial data
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error state
 */

/**
 * @typedef {Object} IncomeRecord
 * @property {string} id - Unique identifier
 * @property {Dayjs} date - Date of income
 * @property {number} amount - Income amount
 * @property {string} category - Income category
 * @property {string} description - Income description
 * @property {string} branchId - Branch identifier
 * @property {string} provinceId - Province identifier
 * @property {string} createdBy - Creator's identifier
 * @property {Dayjs} createdAt - Creation timestamp
 * @property {Dayjs} updatedAt - Last update timestamp
 * @property {('pending'|'approved'|'rejected')} status - Status of the income record
 */

/**
 * @typedef {Object} ExpenseRecord
 * @property {string} id - Unique identifier
 * @property {Dayjs} date - Date of expense
 * @property {number} amount - Expense amount
 * @property {string} category - Expense category
 * @property {string} description - Expense description
 * @property {string} branchId - Branch identifier
 * @property {string} provinceId - Province identifier
 * @property {string} createdBy - Creator's identifier
 * @property {Dayjs} createdAt - Creation timestamp
 * @property {Dayjs} updatedAt - Last update timestamp
 * @property {('pending'|'approved'|'rejected')} status - Status of the expense record
 */

export {};
