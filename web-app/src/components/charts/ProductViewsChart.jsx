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

const MAX_POINTS = 120;

const buildFallbackChart = () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDay);

  const weekDays = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i <= currentDay; i += 1) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const monthName = day.toLocaleDateString("en-US", { month: "short" });
    const dayNum = day.getDate();
    weekDays.push(`${dayNames[i]} (${monthName} ${dayNum})`);
  }

  return {
    labels: weekDays,
    datasets: [
      {
        label: "Sunglasses",
        data: [389, 245, 289, 312, 275, 356, 425].slice(0, currentDay + 1),
        borderColor: "rgb(241, 188, 15)",
        backgroundColor: "rgba(241, 188, 15, 0.1)",
        tension: 0.4,
      },
      {
        label: "Prescription Glasses",
        data: [298, 189, 225, 198, 234, 267, 289].slice(0, currentDay + 1),
        borderColor: "rgb(52, 152, 219)",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        tension: 0.4,
      },
      {
        label: "Blue Light Glasses",
        data: [201, 167, 145, 178, 195, 212, 185].slice(0, currentDay + 1),
        borderColor: "rgb(155, 89, 182)",
        backgroundColor: "rgba(155, 89, 182, 0.1)",
        tension: 0.4,
      },
    ],
    title: `Product Views This Week (${weekDays[0]?.split(" ")[1] || ""} - ${
      weekDays[weekDays.length - 1]?.split(" ")[1] || ""
    }, ${currentDate.getFullYear()})`,
  };
};

const toSafeNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const sanitizeWeeklySeries = (labels, datasets) => {
  if (!Array.isArray(labels) || !Array.isArray(datasets)) {
    return { labels: [], datasets: [] };
  }

  const trimmedLabels = labels.slice(-MAX_POINTS);
  const expectedLength = trimmedLabels.length;

  const trimmedDatasets = datasets.map((dataset) => {
    const rawData = Array.isArray(dataset?.data) ? dataset.data : [];
    const trimmedData = rawData.slice(-MAX_POINTS).map(toSafeNumber);
    const alignedData = trimmedData.slice(-expectedLength);

    return {
      ...dataset,
      data: alignedData,
    };
  });

  return {
    labels: trimmedLabels.slice(-expectedLength),
    datasets: trimmedDatasets,
  };
};

const buildEmptyDataset = (labels) => [
  {
    label: "No views recorded yet",
    data: labels.map(() => 0),
    borderColor: "rgba(148, 163, 184, 0.95)",
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    tension: 0.25,
    borderDash: [6, 6],
    pointRadius: 2,
    pointHoverRadius: 3,
    fill: false,
  },
];

export const ProductViewsChart = ({
  labels: providedLabels,
  datasets: providedDatasets,
  title,
}) => {
  const fallback = buildFallbackChart();
  const sanitized = sanitizeWeeklySeries(providedLabels, providedDatasets);
  const hasProvidedDatasets =
    Array.isArray(providedDatasets) && providedDatasets.length > 0;
  const labels =
    sanitized.labels.length > 0 ? sanitized.labels : fallback.labels;
  const datasets =
    hasProvidedDatasets
      ? sanitized.datasets.map((dataset, index) => {
          const palette = [
            {
              borderColor: "rgb(241, 188, 15)",
              backgroundColor: "rgba(241, 188, 15, 0.1)",
            },
            {
              borderColor: "rgb(52, 152, 219)",
              backgroundColor: "rgba(52, 152, 219, 0.1)",
            },
            {
              borderColor: "rgb(155, 89, 182)",
              backgroundColor: "rgba(155, 89, 182, 0.1)",
            },
          ][index % 3];

          return {
            ...palette,
            ...dataset,
            tension: dataset.tension ?? 0.4,
          };
        })
      : buildEmptyDataset(labels);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title || fallback.title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Views",
        },
      },
      x: {
        title: {
          display: true,
          text: "Day",
        },
      },
    },
  };

  return (
    <div className="chart-canvas-shell">
      <Line options={options} data={{ labels, datasets }} />
    </div>
  );
};
