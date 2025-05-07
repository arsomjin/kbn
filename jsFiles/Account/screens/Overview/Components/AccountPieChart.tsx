import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Row, Col } from "shards-react";
import colors from "utils/colors";
import Chart from "utils/chart";

/**
 * Interface for chart dataset
 */
interface ChartDataset {
  hoverBorderColor: string;
  data: number[];
  icons: string[];
  backgroundColor: string[];
}

/**
 * Interface for chart data
 */
interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Interface for parsed label
 */
interface ParsedLabel {
  title: string;
  icon: string;
  iconColor: string;
  value: number;
}

/**
 * Props interface for AccountPieChart component
 */
interface AccountPieChartProps {
  title?: string;
  branchName: string;
  range?: string;
  chartOptions?: Record<string, any>;
  chartData?: ChartData;
  chartConfig?: Record<string, any>;
  data: number[];
}

/**
 * Component that displays financial data as a pie chart
 */
const AccountPieChart: React.FC<AccountPieChartProps> = ({
  title,
  branchName,
  chartOptions,
  chartData: initialChartData,
  data,
  range,
}) => {
  const [cData, setData] = useState<ChartData | undefined>(initialChartData);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const _chartUpdate = useCallback(
    (data: number[]) => {
      const nextChartData: ChartData = {
        labels: ["รายรับ", "รายจ่าย", "ภาษี"],
        datasets: [
          {
            hoverBorderColor: colors.white.toRGBA(1),
            data,
            icons: [
              '<i class="material-icons">note_add</i>',
              '<i class="material-icons">&#xE2C6;</i>',
              '<i class="material-icons">&#xE8B0;</i>',
            ],
            backgroundColor: [
              colors.primary.toRGBA(0.9),
              colors.primary.toRGBA(0.5),
              colors.primary.toRGBA(0.3),
            ],
          },
        ],
      };
      
      setData(nextChartData);
      
      if (canvasRef.current) {
        const chartConfig = {
          type: "doughnut",
          options: {
            ...{
              legend: false,
              cutoutPercentage: 80,
              tooltips: {
                enabled: false,
                mode: "index",
                position: "nearest",
              },
            },
            ...chartOptions,
          },
          data: nextChartData,
        };
        
        new Chart(canvasRef.current, chartConfig);
      }
    },
    [chartOptions]
  );

  useEffect(() => {
    _chartUpdate(data);
  }, [_chartUpdate, data]);

  const getParsedLabels = (): ParsedLabel[] => {
    if (!cData || typeof cData.labels === "undefined") {
      return [];
    }

    return cData.labels.map((label, idx) => {
      const dataset = cData.datasets[0];

      return {
        title: label,
        icon: dataset.icons[idx],
        iconColor: dataset.backgroundColor[idx],
        value: dataset.data[idx],
      };
    });
  };

  const labels = getParsedLabels();

  return (
    <Card small className="ubd-stats h-100">
      <CardHeader className="border-bottom">
        <h6 className="m-0">{title}</h6>
        <div className="block-handle" />
      </CardHeader>

      <CardBody className="d-flex flex-column">
        {/* Chart */}
        <canvas
          width="100"
          ref={canvasRef}
          className="analytics-users-by-device mt-3 mb-4"
        />

        {/* Legend */}
        <div className="ubd-stats__legend w-75 m-auto pb-4">
          {labels.map((label, idx) => (
            <div key={idx} className="ubd-stats__item">
              {label.icon && (
                <div
                  dangerouslySetInnerHTML={{ __html: label.icon }}
                  style={{ color: label.iconColor }}
                />
              )}
              <span className="ubd-stats__category">{label.title}</span>
              <span className="ubd-stats__value">{label.value}%</span>
            </div>
          ))}
        </div>
      </CardBody>

      <CardFooter className="border-top">
        <Row>
          <Col>
            <p className="text-light">{branchName}</p>
          </Col>
          {/* View Full Report */}
          <Col className="text-right view-report">
            {/* eslint-disable-next-line */}
            <a href="/account/expense-overview">ดูรายงานฉบับเต็ม &rarr;</a>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

AccountPieChart.defaultProps = {
  title: "Account Report",
  chartConfig: Object.create(null),
  chartOptions: Object.create(null),
  chartData: {
    labels: ["รายรับ", "รายจ่าย", "ภาษี"],
    datasets: [
      {
        hoverBorderColor: colors.white.toRGBA(1),
        data: [68.3, 24.2, 7.5],
        icons: [
          '<i class="material-icons">note_add</i>',
          '<i class="material-icons">&#xE2C6;</i>',
          '<i class="material-icons">&#xE8B0;</i>',
        ],
        backgroundColor: [
          colors.primary.toRGBA(0.9),
          colors.primary.toRGBA(0.5),
          colors.primary.toRGBA(0.3),
        ],
      },
    ],
  },
};

export default AccountPieChart;