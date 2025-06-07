import React from 'react';
import { Redirect } from 'react-router-dom';

// Layout Types
import { DefaultLayout, HeaderNavigation, IconSidebar } from './layouts';

// Route Views
import ForgotPassword from './views/ForgotPassword';
import ChangePassword from './views/ChangePassword';
import FileManagerList from './views/FileManagerList';
import FileManagerCards from './views/FileManagerCards';
import TransactionHistory from './views/TransactionHistory';
import Calendar from './views/Calendar';
import AddNewPost from './views/AddNewPost';
import Errors from './views/Errors';
import NotFound from 'views/NotFound';
import ComponentsOverview from './views/ComponentsOverview';
import Tables from './views/Tables';
import BlogPosts from './views/BlogPosts';
import HeaderNav from './views/HeaderNavigation';
import IconSidebarView from './views/IconSidebar';
import AccountOverview from 'Modules/Account/screens/Overview';
import Income from 'Modules/Account/screens/Income';
import IncomeOverview from 'Modules/Account/screens/Income/IncomeOverview';
import IncomeAfterCloseAccount from 'Modules/Account/screens/Income/IncomeAfterCloseAccount';
import IncomeSKL from 'Modules/Account/screens/Income/IncomeSKL';
import IncomeBAAC from 'Modules/Account/screens/Income/IncomeBAAC';
import IncomeCreditCard from 'Modules/Account/screens/Income/IncomeCreditCard';
import Expense from 'Modules/Account/screens/Expense';
import ComingSoon from 'views/ComingSoon';
import Settings from 'Modules/Settings';
import About from 'views/About';
import ImportData from 'views/ImportData';
import Test from 'dev/screens/Test';
import TestPage from 'dev/screens/TestPage';
import TestPage2 from 'dev/screens/TestPage2';
import TestPDF from 'dev/screens/TestPDF';
import FormatContent from 'dev/screens/FormatContent';
import CheckData from 'dev/screens/CheckData';
import Users from 'Modules/Users';
import Overview from 'Modules/Overview';
import Profile from 'Modules/Profile';
import IncomeSummary from 'Modules/Reports/Account/IncomeSummary';
import ExpenseSummary from 'Modules/Reports/Account/ExpenseSummary';
import IncomeExpenseSummary from 'Modules/Reports/Account/IncomeExpenseSummary';
import CustomersReport from 'Modules/Reports/Marketing/Customers';
import MktChannels from 'Modules/Reports/Marketing/SourceOfData';
import BookingAnalytics from 'Modules/Reports/Sales/Bookings/Analytics';
import BookingSummary from 'Modules/Reports/Sales/Bookings/Summary';
import BookingSummaryDetails from 'Modules/Reports/Sales/Bookings/Summary/details';
import SaleMachineReport from 'Modules/Reports/Sales/Machines';
import SaleAnalytics from 'Modules/Reports/Sales/Analytics';
import SaleSummary from 'Modules/Reports/Sales/Summary';
import SaleSummaryDetails from 'Modules/Reports/Sales/Summary/details';
import VehicleModelList from 'Modules/Settings/components/VehicleModelList';
import Marketing from 'Modules/Sales/Marketing';
import StockImport from 'Modules/Warehouses/StockImport';
import StockImportByPurchase from 'Modules/Warehouses/Vehicles/Import/ByPurchase';
import UploadDataFromExcel from 'Modules/Utils/Upload/UploadDataFromExcel';
import ComposeNotification from 'Modules/Publish/ComposeNotification';
import ChangeLogs from 'Modules/Others/ChangeLogs';
import CustomerList from 'Modules/Customers/CustomerList';
import CustomerDetails from 'Modules/Customers/CustomerDetails';
import ReferrerDetails from 'Modules/Referrers/ReferrerDetails';
import SaleVehicles from 'Modules/Sales/Vehicles';
import SaleParts from 'Modules/Sales/Parts';
import ImportSaleParts from 'Modules/Sales/Parts_SKC';
import Booking from 'Modules/Sales/Booking';
import SaleEdit from 'Modules/Sales/SaleEdit';
// import CreditSKL_Input from 'Modules/Credit/CreditSKL/CreditSKL_Input';
// import CreditKBN_Input from 'Modules/Credit/CreditKBN/CreditKBN_Input';
// import CreditBAA_Input from 'Modules/Credit/CreditBAA/CreditBAA_Input';
// import CreditCash_Input from 'Modules/Credit/CreditCash/CreditCash_Input';
import ImportServiceData from 'Modules/Service/Service_SKC';
import InputServiceData from 'Modules/Service/Input/GasCost';
import ImportPartsData from 'Modules/Warehouses/Parts/Import/ByPurchase';
import TransferOut from 'Modules/Warehouses/Vehicles/Export/ByTransfer';
import TransferIn from 'Modules/Warehouses/Vehicles/Import/ByTransfer';
import DecalRecord from 'Modules/Warehouses/Decal/DecalRecord';
import DecalWithdraw from 'Modules/Warehouses/Decal/DecalWithdraw';
import CustomerDeliver from 'Modules/Warehouses/Delivery/CustomerDeliver';
import Giveaways from 'Modules/Warehouses/Giveaways';
import BranchDeliver from 'Modules/Warehouses/Delivery/BranchDeliver';
import PurchasePlan from 'Modules/Warehouses/PurchasePlan';
import ImportByOther from 'Modules/Warehouses/Vehicles/Import/ByOther';
import ExportByOther from 'Modules/Warehouses/Vehicles/Export/ByOther';
import BySale from 'Modules/Warehouses/Vehicles/Export/BySale';
import CustomerNewMachines from 'Modules/Registration/Customers/NewMachines';
import UserManual from 'Modules/UserManual';
import Assessment from 'Modules/Sales/Assessment';
import InputPrice from 'Modules/Account/screens/InputPrice';
import SalesByPerson from 'Modules/Reports/Sales/SalesByPerson';
import Chevrolet from 'Modules/Account/screens/Expense/Components/Chevrolet';
import ExpenseTransferCycle from 'Modules/Account/screens/ExpenseTransferCycle';
import TestPrint from 'dev/screens/TestPrint';
import TestMultiProvince from 'dev/screens/TestMultiProvince';
import IncomeParts from 'Modules/Reports/Parts/Income';
import SaleAssessmentReport from 'Modules/Reports/Sales/Assessment';
import SaleAssessmentReportDetails from 'Modules/Reports/Sales/Assessment/details';
import SaleChannelReportDetails from 'Modules/Reports/Marketing/SourceOfData/details';
import InputData from 'Modules/Credit/Components/InputData';
import IncomeDaily from 'Modules/Account/screens/Income/IncomeDaily';
import ByModel from 'Modules/Reports/Warehouses/Vehicles/ByModel';
import VehicleStockReport from 'Modules/Reports/Warehouses/Vehicles/Stocks';
import VehicleTransferInReport from 'Modules/Reports/Warehouses/Vehicles/TransferIn';
import VehicleTransferOutReport from 'Modules/Reports/Warehouses/Vehicles/TransferOut';
import VehicleTransferReport from 'Modules/Reports/Warehouses/Vehicles/Transfer';
import Decal from 'Modules/Reports/Warehouses/Vehicles/Decal';
import CustomerDeliveryPlan from 'Modules/Reports/Warehouses/Vehicles/DeliveryPlan/CustomerDeliveryPlan';
import BranchDeliveryPlan from 'Modules/Reports/Warehouses/Vehicles/DeliveryPlan/BranchDeliveryPlan';
import InputPrice_Parts from 'Modules/Account/screens/InputPrice_Parts';
import PartList from 'Modules/Settings/components/PartList';
import ServiceOrder from 'Modules/Service/ServiceOrder';
import ServiceList from 'Modules/Settings/components/ServiceList';
import ExpenseCategoryList from 'Modules/Settings/components/ExpenseCategoryList';
import ExpenseSubCategoryList from 'Modules/Settings/components/ExpenseSubCategoryList';
import ExpenseNameList from 'Modules/Settings/components/ExpenseNameList';
import ServiceClose from 'Modules/Service/ServiceClose';
import ServiceDailyList from 'Modules/Reports/Services/Daily/List';
import ServiceDailyIncome from 'Modules/Reports/Services/Daily/DailyIncome';
import ServiceCustomers from 'Modules/Reports/Services/ServiceCustomers';
import ServiceType from 'Modules/Reports/Services/ServiceType';
import ServiceAmount from 'Modules/Reports/Services/ServiceAmount';
import ServiceMechanic from 'Modules/Reports/Services/ServiceMechanic';
import CreditSummary from 'Modules/Reports/Credit/Summary';
import CreditSummaryDaily from 'Modules/Reports/Credit/SummaryDaily';
import BookingCancel from 'Modules/Sales/BookingCancel';
import BookingEdit from 'Modules/Sales/BookingEdit';
import Employees from 'Modules/Employees';
import InputPrice_Edit from 'Modules/Account/screens/InputPrice_Edit';
import Canceled from 'Modules/Reports/Sales/Canceled';
import CanceledDetails from 'Modules/Reports/Sales/Canceled/details';
import Reservation from 'Modules/Reports/Sales/Reservation';
import ReservationDetails from 'Modules/Reports/Sales/Reservation/details';
import Leave from 'Modules/HR/Leave';
import Attendance from 'Modules/HR/Attendance';
import AttendanceReport from 'Modules/Reports/HR/Attendance';
import LeavingReport from 'Modules/Reports/HR/Leaving';
import ExpenseReferrer from 'Modules/Account/screens/Expense/Referrer';
import DailyMoneySummary from 'Modules/Reports/Account/DailyMoneySummary';
import BankDeposit from 'Modules/Reports/Account/BankDeposit';
import AccountIncomeParts from 'Modules/Reports/Account/AccountIncomeParts';
import AccountIncomePartsKBN from 'Modules/Reports/Account/AccountIncomePartsKBN';
import AccountIncomeOther from 'Modules/Reports/Account/AccountIncomeOther';
import AccountIncomeRepay from 'Modules/Reports/Account/AccountIncomeRepay';
import NewTracktorRevenue from 'Modules/Reports/Account/NewTracktorRevenue';
import TaxInvoiceParts from 'Modules/Reports/Account/TaxInvoiceParts';
import TaxInvoiceVehicles from 'Modules/Reports/Account/TaxInvoiceVehicles';
import ExcelExport03 from 'Modules/Utils/Excels/excel_export_03';
import DailyBankDeposit from 'Modules/Account/screens/Income/DailyBankDeposit';
import DailyExecutiveCashDeposit from 'Modules/Account/screens/Income/DailyExecutiveCashDeposit';
import IncomePersonalLoan from 'Modules/Account/screens/Income/IncomePersonalLoan';
import IncomePersonalLoanReport from 'Modules/Reports/Account/IncomePersonalLoanReport';

const BlankIconSidebarLayout = ({ children }) => (
  <IconSidebar noNavbar noFooter>
    {children}
  </IconSidebar>
);
const FullLayout = ({ children }) => <DefaultLayout noFooter>{children}</DefaultLayout>;

export default [
  {
    path: '/',
    exact: true,
    layout: DefaultLayout,
    component: () => <Redirect to="/overview" />
  },
  {
    path: '/overview',
    layout: DefaultLayout,
    component: Overview
  },
  // {
  //   path: '/account',
  //   layout: DefaultLayout,
  //   component: Accounts,
  // },
  {
    path: '/reports/account-overview',
    layout: DefaultLayout,
    component: AccountOverview
  },
  {
    path: '/account/income-overview',
    layout: DefaultLayout,
    component: Income
  },
  {
    path: '/account/income-input',
    layout: DefaultLayout,
    component: IncomeOverview
  },
  {
    path: '/account/income-daily',
    layout: DefaultLayout,
    component: IncomeDaily
  },
  {
    path: '/account/income-after-close-account',
    layout: DefaultLayout,
    // component: () => <ComingSoon inProgress />,
    component: IncomeAfterCloseAccount
  },
  {
    path: '/account/income-skl',
    layout: DefaultLayout,
    component: IncomeSKL
  },
  {
    path: '/account/income-personal-loan',
    layout: DefaultLayout,
    component: IncomePersonalLoan
  },
  {
    path: '/account/income-baac',
    layout: DefaultLayout,
    component: IncomeBAAC
  },
  {
    path: '/account/daily-bank-deposit',
    layout: DefaultLayout,
    component: DailyBankDeposit
  },
  {
    path: '/account/daily-executive-cash-deposit',
    layout: DefaultLayout,
    component: DailyExecutiveCashDeposit
  },
  {
    path: '/account/income-credit-card',
    layout: DefaultLayout,
    component: IncomeCreditCard
  },
  {
    path: '/account/expense-overview',
    layout: DefaultLayout,
    component: Expense
  },
  {
    path: '/account/expense-input',
    layout: DefaultLayout,
    component: Expense
  },
  {
    path: '/account/expense-transfer-cycle',
    layout: DefaultLayout,
    component: ExpenseTransferCycle
  },
  {
    path: '/account/expense-chevrolet',
    layout: DefaultLayout,
    component: Chevrolet
  },
  {
    path: '/account/expense-referrer',
    layout: DefaultLayout,
    component: ExpenseReferrer
  },
  {
    path: '/account/price-input',
    layout: DefaultLayout,
    component: InputPrice
  },
  {
    path: '/account/price-input-parts',
    layout: DefaultLayout,
    component: InputPrice_Parts
  },
  {
    path: '/account/price-input-edit',
    layout: DefaultLayout,
    component: InputPrice_Edit
  },
  {
    path: '/sale-machines',
    layout: DefaultLayout,
    component: SaleVehicles
  },
  {
    path: '/sale-parts',
    layout: DefaultLayout,
    component: SaleParts
  },
  {
    path: '/skc-sale-parts',
    layout: DefaultLayout,
    component: ImportSaleParts
  },
  {
    path: '/sale-marketing',
    layout: DefaultLayout,
    component: Marketing
  },
  {
    path: '/sale-booking',
    layout: DefaultLayout,
    component: Booking
  },
  {
    path: '/sale-reservation-edit',
    layout: DefaultLayout,
    component: BookingEdit
  },
  {
    path: '/sale-reservation-cancellation',
    layout: DefaultLayout,
    component: BookingCancel
  },
  {
    path: '/sale-assessment',
    layout: DefaultLayout,
    component: Assessment
  },
  {
    path: '/sale-customer-list',
    layout: DefaultLayout,
    component: () => <CustomerList />
  },
  {
    path: '/edit-sale-order',
    layout: DefaultLayout,
    component: SaleEdit
  },
  {
    path: '/customer-details',
    layout: DefaultLayout,
    component: CustomerDetails
  },
  // {
  //   path: '/referrer-list',
  //   layout: DefaultLayout,
  //   component: () => <ReferrerList />,
  // },
  {
    path: '/referrer-details',
    layout: DefaultLayout,
    component: () => <ReferrerDetails />
  },
  // {
  //   path: '/service-input',
  //   layout: DefaultLayout,
  //   component: ServiceInput,
  // },
  {
    path: '/service-order',
    layout: DefaultLayout,
    // component: () => <ComingSoon inProgress info="แจ้งบริการ/ประเมินราคา" />,
    component: ServiceOrder
  },
  {
    path: '/service-close',
    layout: DefaultLayout,
    // component: () => <ComingSoon inProgress info="สรุปปิดงาน" />,
    component: ServiceClose
  },
  {
    path: '/service-data-skc',
    layout: DefaultLayout,
    component: ImportServiceData
  },
  {
    path: '/service-gas',
    layout: DefaultLayout,
    component: InputServiceData
  },
  {
    path: '/warehouse/vehicles',
    layout: DefaultLayout,
    component: () => <ComingSoon inProgress info="รถและอุปกรณ์" />
  },
  {
    path: '/warehouse/purchase-plan',
    layout: DefaultLayout,
    component: PurchasePlan
  },
  {
    path: '/warehouse/purchase',
    layout: DefaultLayout,
    component: () => <ComingSoon info="ซื้อสินค้า" />
  },
  {
    path: '/warehouse/import-by-purchase',
    layout: DefaultLayout,
    component: StockImportByPurchase
  },
  {
    path: '/warehouse/import-by-transfer',
    layout: DefaultLayout,
    component: TransferIn
  },
  {
    path: '/warehouse/other-import',
    layout: DefaultLayout,
    component: ImportByOther
  },
  {
    path: '/warehouse/export-by-sale',
    layout: DefaultLayout,
    component: BySale
  },
  {
    path: '/warehouse/export-by-transfer',
    layout: DefaultLayout,
    component: TransferOut
  },
  {
    path: '/warehouse/other-export',
    layout: DefaultLayout,
    component: ExportByOther
  },
  {
    path: '/warehouse/import-parts',
    layout: DefaultLayout,
    component: ImportPartsData
  },
  {
    path: '/warehouse/parts',
    layout: DefaultLayout,
    component: () => <ComingSoon inProgress info="อะไหล่" />
  },
  {
    path: '/warehouse/decal-record',
    layout: DefaultLayout,
    component: DecalRecord
  },
  {
    path: '/warehouse/decal-withdraw',
    layout: DefaultLayout,
    component: DecalWithdraw
  },
  {
    path: '/warehouse/customer-deliver-plan',
    layout: DefaultLayout,
    component: CustomerDeliver
  },
  {
    path: '/warehouse/branch-deliver-plan',
    layout: DefaultLayout,
    component: BranchDeliver
  },
  {
    path: '/warehouse/stock-import',
    layout: DefaultLayout,
    component: () => <StockImport />
  },
  {
    path: '/credit/input-data',
    layout: DefaultLayout,
    component: InputData
  },
  // {
  //   path: '/credit-skl/input-data',
  //   layout: DefaultLayout,
  //   component: CreditSKL_Input,
  // },
  // {
  //   path: '/credit-baa/input-data',
  //   layout: DefaultLayout,
  //   component: CreditBAA_Input,
  // },
  // {
  //   path: '/credit-kbn/input-data',
  //   layout: DefaultLayout,
  //   component: CreditKBN_Input,
  // },
  // {
  //   path: '/credit-cash/input-data',
  //   layout: DefaultLayout,
  //   component: CreditCash_Input,
  // },
  {
    path: '/users',
    layout: DefaultLayout,
    component: Users
  },
  {
    path: '/employees',
    layout: DefaultLayout,
    component: Employees
  },
  {
    path: '/hr/leave',
    layout: DefaultLayout,
    component: Leave
  },
  {
    path: '/hr/attendance',
    layout: DefaultLayout,
    component: Attendance
    // component: () => <ComingSoon info="อัปโหลดข้อมูล สแกนลายนิ้วมือ" />,
  },
  {
    path: '/data-import',
    layout: DefaultLayout,
    component: ImportData
  },
  {
    path: '/data-managers/export-files',
    layout: DefaultLayout,
    // component: ExportFiles,
    component: ExcelExport03
  },
  {
    path: '/setting-branches',
    layout: DefaultLayout,
    component: Settings
  },
  {
    path: '/setting-users',
    layout: DefaultLayout,
    component: Settings
  },
  {
    path: '/setting-account',
    layout: DefaultLayout,
    component: Settings
  },
  {
    path: '/setting-vehicles',
    layout: DefaultLayout,
    component: VehicleModelList
  },
  {
    path: '/setting-parts',
    layout: DefaultLayout,
    component: PartList
  },
  {
    path: '/setting-services',
    layout: DefaultLayout,
    component: ServiceList
  },
  // {
  //   path: '/setting-vehicle-model',
  //   layout: DefaultLayout,
  //   component: VehicleModelList,
  // },
  {
    path: '/setting-promotions',
    layout: DefaultLayout,
    component: Settings
  },
  {
    path: '/setting-expense-category',
    layout: DefaultLayout,
    component: ExpenseCategoryList
  },
  {
    path: '/setting-expense-subCategory',
    layout: DefaultLayout,
    component: ExpenseSubCategoryList
  },
  {
    path: '/setting-expense-name',
    layout: DefaultLayout,
    component: ExpenseNameList
  },
  {
    path: '/user-profile',
    layout: DefaultLayout,
    component: Profile
  },
  {
    path: '/registration/customer/new-machines',
    layout: DefaultLayout,
    component: CustomerNewMachines
  },
  // {
  //   path: '/reports',
  //   layout: DefaultLayout,
  //   component: Reports,
  // },
  {
    path: '/reports/income-summary',
    layout: DefaultLayout,
    component: IncomeSummary
  },
  {
    path: '/reports/income-parts',
    layout: DefaultLayout,
    component: IncomeParts
  },
  {
    path: '/reports/daily-money-summary',
    layout: DefaultLayout,
    component: DailyMoneySummary
  },
  {
    path: '/reports/bank-deposit',
    layout: DefaultLayout,
    component: BankDeposit
  },
  {
    path: '/reports/income-parts-kbn',
    layout: DefaultLayout,
    component: AccountIncomePartsKBN
  },
  {
    path: '/reports/income-personal-loan',
    layout: DefaultLayout,
    component: IncomePersonalLoanReport
  },
  {
    path: '/reports/income-parts-all',
    layout: DefaultLayout,
    component: AccountIncomeParts
  },
  {
    path: '/reports/money-return',
    layout: DefaultLayout,
    component: AccountIncomeRepay
  },
  {
    path: '/reports/income-others',
    layout: DefaultLayout,
    component: AccountIncomeOther
  },
  {
    path: '/reports/tracktor-revenue',
    layout: DefaultLayout,
    component: NewTracktorRevenue
  },
  {
    path: '/reports/expense-summary',
    layout: DefaultLayout,
    component: ExpenseSummary
  },
  {
    path: '/reports/income-expense-summary',
    layout: DefaultLayout,
    component: IncomeExpenseSummary
  },
  {
    path: '/reports/account/tax-invoice-vehicles',
    layout: DefaultLayout,
    component: TaxInvoiceVehicles
  },
  {
    path: '/reports/account/tax-invoice-parts',
    layout: DefaultLayout,
    component: TaxInvoiceParts
  },
  {
    path: '/reports/mkt/customers',
    layout: DefaultLayout,
    component: CustomersReport
  },
  {
    path: '/reports/mkt/marketing-channels',
    layout: DefaultLayout,
    component: MktChannels
  },
  {
    path: '/reports/sale-channel-details',
    layout: DefaultLayout,
    component: SaleChannelReportDetails
  },
  // {
  //   path: '/reports/customers-list',
  //   layout: DefaultLayout,
  //   component: CustomersList,
  // },
  {
    path: '/reports/sale-analytics',
    layout: DefaultLayout,
    component: SaleAnalytics
  },
  {
    path: '/reports/sale-summary',
    layout: DefaultLayout,
    component: SaleSummary
  },
  {
    path: '/reports/sale-summary-details',
    layout: DefaultLayout,
    component: SaleSummaryDetails
  },
  {
    path: '/reports/sale-machines',
    layout: DefaultLayout,
    component: SaleMachineReport
  },
  {
    path: '/reports/sale-booking-summary',
    layout: DefaultLayout,
    component: BookingSummary
  },
  {
    path: '/reports/sale-booking-summary-details',
    layout: DefaultLayout,
    component: BookingSummaryDetails
  },
  {
    path: '/reports/sale-booking-analytics',
    layout: DefaultLayout,
    component: BookingAnalytics
  },
  {
    path: '/reports/sale-by-person',
    layout: DefaultLayout,
    component: SalesByPerson
  },
  {
    path: '/reports/sale-assessment',
    layout: DefaultLayout,
    component: SaleAssessmentReport
  },
  {
    path: '/reports/sale-assessment-details',
    layout: DefaultLayout,
    component: SaleAssessmentReportDetails
  },
  {
    path: '/reports/reservation-cancellation',
    layout: DefaultLayout,
    component: Canceled
  },
  {
    path: '/reports/reservation-cancellation-details',
    layout: DefaultLayout,
    component: CanceledDetails
  },
  {
    path: '/reports/all-reservation',
    layout: DefaultLayout,
    component: Reservation
  },
  {
    path: '/reports/all-reservation-details',
    layout: DefaultLayout,
    component: ReservationDetails
  },
  {
    path: '/reports/warehouse/vehicles/models',
    layout: DefaultLayout,
    component: ByModel
  },
  {
    path: '/reports/warehouse/vehicles/stocks',
    layout: DefaultLayout,
    component: VehicleStockReport
  },
  {
    path: '/reports/warehouse/vehicles/transferIn',
    layout: DefaultLayout,
    component: VehicleTransferInReport
  },
  {
    path: '/reports/warehouse/vehicles/transferOut',
    layout: DefaultLayout,
    component: VehicleTransferOutReport
  },
  {
    path: '/reports/warehouse/vehicles/transfer',
    layout: DefaultLayout,
    component: VehicleTransferReport
  },
  {
    path: '/reports/warehouse/decal',
    layout: DefaultLayout,
    component: Decal
  },
  {
    path: '/reports/warehouse/vehicles/customerDeliveryPlan',
    layout: DefaultLayout,
    component: CustomerDeliveryPlan
  },
  {
    path: '/reports/warehouse/vehicles/branchDeliveryPlan',
    layout: DefaultLayout,
    component: BranchDeliveryPlan
  },
  {
    path: '/reports/warehouse/giveaways',
    layout: DefaultLayout,
    component: Giveaways
  },
  {
    path: '/reports/service-daily/list',
    layout: DefaultLayout,
    component: ServiceDailyList
    // component: () => <ComingSoon inProgress info="รายงานการบันทึกประจำวัน" />,
  },
  {
    path: '/reports/service-daily/income',
    layout: DefaultLayout,
    component: ServiceDailyIncome
    // component: () => <ComingSoon inProgress info="รายงานสรุปรายรับ" />,
  },
  {
    path: '/reports/service-customer',
    layout: DefaultLayout,
    component: ServiceCustomers
    // component: () => <ComingSoon info="รายงานสรุปจำนวนลูกค้าที่ให้บริการ" />,
  },
  {
    path: '/reports/service-type',
    layout: DefaultLayout,
    component: ServiceType
    // component: () => <ComingSoon info="รายงานสรุปแบ่งตามประเภท" />,
  },
  {
    path: '/reports/service-works',
    layout: DefaultLayout,
    component: () => <ComingSoon info="รายงานสรุปแบ่งตามงาน" />
  },
  {
    path: '/reports/service-amount',
    layout: DefaultLayout,
    component: ServiceAmount
    // component: () => <ComingSoon info="รายงานสรุปยอด" />,
  },
  {
    path: '/reports/service-mechanic',
    layout: DefaultLayout,
    component: ServiceMechanic
    // component: () => <ComingSoon info="รายงานการจัดอันดับช่าง" />,
  },
  {
    path: '/reports/credit/summary',
    layout: DefaultLayout,
    component: CreditSummary
    // component: () => <ComingSoon info="ยอดตัดขาย-ส่งสัญญา" />,
  },
  {
    path: '/reports/credit/summary-daily',
    layout: DefaultLayout,
    component: CreditSummaryDaily
    // component: () => <ComingSoon info="สรุปยอดประจำวัน" />,
  },
  {
    path: '/reports/hr/attendance',
    layout: DefaultLayout,
    component: AttendanceReport
    // component: () => <ComingSoon info="รายงานสถิติการทำงาน" />,
  },
  {
    path: '/reports/hr/leaving',
    layout: DefaultLayout,
    component: LeavingReport
  },
  {
    path: '/reports/hr/attendance-summary',
    layout: DefaultLayout,
    component: () => <ComingSoon info="รายงานการลางานประจำปี" />
  },
  {
    path: '/user-manual/account',
    layout: FullLayout,
    component: UserManual
  },
  {
    path: '/user-manual/sale',
    layout: FullLayout,
    component: UserManual
  },
  {
    path: '/user-manual/service',
    layout: FullLayout,
    component: UserManual
  },
  {
    path: '/user-manual/warehouse',
    layout: FullLayout,
    component: UserManual
  },
  {
    path: '/user-manual/credit',
    layout: FullLayout,
    component: UserManual
  },
  {
    path: '/about',
    layout: DefaultLayout,
    component: About
  },
  {
    path: '/changelogs',
    layout: DefaultLayout,
    component: ChangeLogs
  },
  {
    path: '/forgot-password',
    layout: BlankIconSidebarLayout,
    component: ForgotPassword
  },
  {
    path: '/change-password',
    layout: BlankIconSidebarLayout,
    component: ChangePassword
  },
  {
    path: '/not-found',
    layout: DefaultLayout,
    component: NotFound
  },
  {
    path: '/file-manager-list',
    layout: DefaultLayout,
    component: FileManagerList
  },
  {
    path: '/file-manager-cards',
    layout: DefaultLayout,
    component: FileManagerCards
  },
  {
    path: '/transaction-history',
    layout: DefaultLayout,
    component: TransactionHistory
  },
  {
    path: '/calendar',
    layout: DefaultLayout,
    component: Calendar
  },
  {
    path: '/add-new-post',
    layout: DefaultLayout,
    component: AddNewPost
  },
  {
    path: '/errors',
    layout: BlankIconSidebarLayout,
    component: Errors
  },
  {
    path: '/components-overview',
    layout: DefaultLayout,
    component: ComponentsOverview
  },
  {
    path: '/tables',
    layout: DefaultLayout,
    component: Tables
  },
  {
    path: '/blog-posts',
    layout: DefaultLayout,
    component: BlogPosts
  },
  {
    path: '/header-navigation',
    layout: HeaderNavigation,
    component: HeaderNav
  },
  {
    path: '/icon-sidebar-nav',
    layout: IconSidebar,
    component: IconSidebarView
  },
  {
    path: '/utils/upload-data-from-excel-file',
    layout: DefaultLayout,
    component: UploadDataFromExcel
  },
  {
    path: '/executive/send-notification',
    layout: DefaultLayout,
    component: ComposeNotification
  },
  {
    path: '/executive/send-information',
    layout: DefaultLayout,
    component: () => <ComingSoon info="Publish news and announcements" />
  },
  {
    path: '/developer/test-import',
    layout: DefaultLayout,
    component: ImportData
    // component: () => <ComingSoon info="Test Data Import" />,
  },
  {
    path: '/developer/test-general',
    layout: DefaultLayout,
    component: Test
    // component: () => <ComingSoon info="Test Data Import" />,
  },
  {
    path: '/developer/template-page',
    layout: DefaultLayout,
    component: TestPage
  },
  {
    path: '/developer/template-page2',
    layout: DefaultLayout,
    component: TestPage2
  },
  {
    path: '/developer/template-pdf-viewer',
    layout: DefaultLayout,
    component: TestPDF
  },
  {
    path: '/developer/format-content',
    layout: DefaultLayout,
    component: FormatContent
  },
  {
    path: '/developer/update-data',
    layout: DefaultLayout,
    component: CheckData
  },
  {
    path: '/developer/test-print',
    layout: DefaultLayout,
    component: TestPrint
  },
  {
    path: '/developer/test-multi-province',
    layout: DefaultLayout,
    component: TestMultiProvince
  }
];
