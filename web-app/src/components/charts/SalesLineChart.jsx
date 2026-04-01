import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DEFAULT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DEFAULT_SALES_DATA = [
  95000, 102000, 88000, 125000, 138000, 145000, 135000, 142000, 128000,
  110000, 95000, 165000,
];

export const SalesLineChart = ({
  labels: providedLabels,
  values: providedValues,
  year: providedYear,
  title,
  datasetLabel,
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const labels =
    Array.isArray(providedLabels) && providedLabels.length > 0
      ? providedLabels
      : DEFAULT_MONTHS.slice(0, currentMonth + 1);
  const salesData =
    Array.isArray(providedValues) && providedValues.length > 0
      ? providedValues
      : DEFAULT_SALES_DATA.slice(0, currentMonth + 1);
  const chartYear = providedYear || currentYear;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title || `Monthly Sales Trend (${chartYear} YTD)`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Sales (PHP)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: datasetLabel || `${chartYear} Monthly Sales`,
        data: salesData,
        borderColor: "rgb(46, 204, 113)",
        backgroundColor: "rgba(46, 204, 113, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
};
