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

const MAX_POINTS = 120;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const toSafeNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const toSafeYear = (value, fallbackYear) => {
  const year = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return fallbackYear;
  }
  return year;
};

const toSafeLabel = (value, fallbackIndex) => {
  const fallbackLabel = DEFAULT_MONTHS[fallbackIndex % 12];
  if (typeof value !== "string" && typeof value !== "number") return fallbackLabel;
  const raw = String(value).trim();
  if (!raw) return fallbackLabel;
  return raw.length > 18 ? `${raw.slice(0, 18)}...` : raw;
};

const buildSanitizedSalesSeries = (providedLabels, providedValues, fallbackCount) => {
  const fallbackLabels = DEFAULT_MONTHS.slice(0, fallbackCount);
  const fallbackValues = DEFAULT_SALES_DATA.slice(0, fallbackCount);

  if (!Array.isArray(providedLabels) || !Array.isArray(providedValues)) {
    return { labels: fallbackLabels, values: fallbackValues };
  }

  const maxPoints = Math.max(1, MAX_POINTS);
  const trimmedLabels = providedLabels.slice(-maxPoints);
  const trimmedValues = providedValues.slice(-maxPoints).map(toSafeNumber);
  const pairCount = Math.min(trimmedLabels.length, trimmedValues.length);

  if (pairCount === 0) {
    return { labels: fallbackLabels, values: fallbackValues };
  }

  return {
    labels: trimmedLabels
      .slice(0, pairCount)
      .map((label, index) => toSafeLabel(label, index)),
    values: trimmedValues.slice(0, pairCount),
  };
};

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
  const fallbackCount = currentMonth + 1;
  const { labels, values: salesData } = buildSanitizedSalesSeries(
    providedLabels,
    providedValues,
    fallbackCount
  );
  const chartYear = toSafeYear(providedYear, currentYear);

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

  return (
    <div className="chart-canvas-shell">
      <Line options={options} data={data} />
    </div>
  );
};
