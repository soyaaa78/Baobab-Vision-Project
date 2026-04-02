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

export const ProductViewsChart = ({
  labels: providedLabels,
  datasets: providedDatasets,
  title,
  emptyMessage = "No product view data yet.",
}) => {
  const fallback = buildFallbackChart();
  const labels =
    Array.isArray(providedLabels) && providedLabels.length > 0
      ? providedLabels
      : fallback.labels;
  const datasets =
    Array.isArray(providedDatasets) && providedDatasets.length > 0
      ? providedDatasets.map((dataset, index) => {
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
      : fallback.datasets;

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

  const hasAnyData =
    Array.isArray(providedDatasets) && providedDatasets.length > 0
      ? providedDatasets.some((dataset) =>
          Array.isArray(dataset.data) && dataset.data.some((value) => Number(value) > 0)
        )
      : true;

  if (Array.isArray(providedDatasets) && providedDatasets.length === 0) {
    return (
      <div
        style={{
          minHeight: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontStyle: "italic",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  if (Array.isArray(providedDatasets) && !hasAnyData) {
    return (
      <div
        style={{
          minHeight: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontStyle: "italic",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return <Line options={options} data={{ labels, datasets }} />;
};
