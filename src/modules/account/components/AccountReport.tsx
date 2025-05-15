import React from "react";
import { useTranslation } from "react-i18next";
import { Card, Typography, DatePicker } from "antd";
import { Line } from "@ant-design/plots";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import { AccountReportProps } from "../types";
import { formatCurrency } from "utils/format";
import { useTheme } from "hooks/useTheme";

const { Title } = Typography;
const { RangePicker } = DatePicker;

/**
 * Account report component with line chart
 */
export const AccountReport: React.FC<AccountReportProps> = ({
  title,
  branchName,
  range,
  onRangeChange,
  data
}) => {
  const { t } = useTranslation("account", "common");
  const { isDarkMode } = useTheme();

  const chartData = data.data.map(point => ({
    date: point.date.toFormat('yyyy-MM-dd'),
    value: point.income,
    type: t('income')
  })).concat(data.data.map(point => ({
    date: point.date.toFormat('yyyy-MM-dd'),
    value: point.expense,
    type: t('expense')
  })));

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v: string) => `฿${parseInt(v).toLocaleString()}`
      }
    },
    legend: {
      position: 'top'
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    },
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <Card
      title={title}
      className="dark:bg-gray-800 dark:border-gray-700"
      extra={
        <RangePicker
          value={[dayjs(range[0].toJSDate()), dayjs(range[1].toJSDate())]}
          onChange={(dates) => {
            if (dates) {
              onRangeChange([
                DateTime.fromJSDate(dates[0]!.toDate()),
                DateTime.fromJSDate(dates[1]!.toDate())
              ]);
            }
          }}
          className="dark:bg-gray-700 dark:border-gray-600"
        />
      }
    >
      <Line {...config} />
    </Card>
  );
}; 