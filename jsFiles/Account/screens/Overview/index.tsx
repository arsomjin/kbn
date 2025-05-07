import React, { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "shards-react";
import PageTitle from "components/common/PageTitle";
import AccountReport from "./Components/AccountReport";
import AccountPieChart from "./Components/AccountPieChart";
import { useSelector } from "react-redux";
import { Select, Skeleton } from "antd";
import { dateData, monthData, weekData, yearData } from "./data";
import AccountTable from "./Components/AccountTable";
import { Numb } from "functions";
const { Option } = Select;

/**
 * Interface for financial data structure
 */
interface FinancialData {
  date: string;
  income: number;
  expense: number;
  tax: number;
  [key: string]: any;
}

/**
 * Interface for branch data
 */
interface Branch {
  branchName: string;
  [key: string]: any;
}

/**
 * Overview component for Account module
 */
const Overview: React.FC = () => {
  const { branches } = useSelector((state: any) => state.data);
  const [branchCode, setBranch] = useState<string>("all");
  const [range, setRange] = useState<string>("เดือน");
  const [data, setData] = useState<FinancialData[]>([]);
  const [pieData, setPieData] = useState<number[]>([]);

  /**
   * Get financial data based on selected time range
   * @param range - Selected time range (day, week, month, year)
   */
  const _getData = (range: string): void => {
    let result: FinancialData[] = [];
    switch (range) {
      case "วัน":
        result = dateData;
        break;
      case "สัปดาห์":
        result = weekData;
        break;
      case "เดือน":
        result = monthData;
        break;
      case "ปี":
        result = yearData;
        break;
      default:
        break;
    }
    
    // Calculate summary values
    let income: number = result.reduce((sum, elem) => sum + elem.income, 0);
    let expense: number = result.reduce((sum, elem) => sum + elem.expense, 0);
    let tax: number = result.reduce((sum, elem) => sum + elem.tax, 0);
    let total: number = income + expense + tax;

    setData(result);
    
    // Calculate percentage values for pie chart
    let dataArr: number[] = [
      Numb(((income / total) * 100).toFixed(2)),
      Numb(((expense / total) * 100).toFixed(2)),
      Numb(((tax / total) * 100).toFixed(2)),
    ];
    setPieData(dataArr);
  };

  useEffect(() => {
    _getData("เดือน");
  }, []);

  /**
   * Handle branch selection change
   * @param br - Selected branch code
   */
  const _onBranchSelected = (br: string): void => {
    setBranch(br);
  };

  /**
   * Handle time range selection change
   * @param rng - Selected time range
   */
  const _onRangeChange = useCallback((rng: string): void => {
    setRange(rng);
    _getData(rng);
  }, []);

  // Build select options for branches
  const selectOptions = [
    <Option key="all" value="all">
      ทุกสาขา
    </Option>,
    ...Object.keys(branches).map((key) => (
      <Option key={key} value={key}>
        {branches[key].branchName}
      </Option>
    )),
  ];

  return (
    <Container fluid className="main-content-container px-4">
      <Row noGutters className="page-header py-4">
        <PageTitle
          title="บัญชี"
          subtitle="ภาพรวม"
          className="text-sm-left mb-3"
        />
        <Col sm="4" className="d-flex mt-3">
          <Select
            placeholder="เลือกสาขา"
            defaultValue="all"
            onChange={(ev: string) => _onBranchSelected(ev)}
            style={{ width: 240 }}
          >
            {selectOptions}
          </Select>
        </Col>
      </Row>

      <Row>
        {/* Sales Report */}
        <Col lg="8" md="12" sm="12" className="mb-4">
          {data.length > 0 ? (
            <AccountReport
              data={data}
              range={range}
              onRangeChange={_onRangeChange}
              branchName={
                branchCode === "all"
                  ? "ทั้งหมด"
                  : branches[branchCode].branchName
              }
            />
          ) : (
            <Skeleton active />
          )}
        </Col>

        {/* Sales by Categories */}
        <Col lg="4" md="6" sm="6" className="mb-4">
          <AccountPieChart
            data={pieData}
            branchName={
              branchCode === "all" ? "ทั้งหมด" : branches[branchCode].branchName
            }
            range={`ราย${range}`}
          />
        </Col>
      </Row>
      <AccountTable data={data} range={range} />
      <p className="text-light text-right my-4 mx-4">
        หมายเหตุ: ข้อมูลที่แสดง ยังไม่ใข่ข้อมูลจริง *
      </p>
    </Container>
  );
};

export default Overview;