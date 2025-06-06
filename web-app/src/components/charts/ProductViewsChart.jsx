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

export const ProductViewsChart = () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDay);

  const weekDays = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i <= currentDay; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const monthName = day.toLocaleDateString("en-US", { month: "short" });
    const dayNum = day.getDate();
    weekDays.push(`${dayNames[i]} (${monthName} ${dayNum})`);
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Product Views This Week (${weekDays[0].split(" ")[1]} - ${
          weekDays[weekDays.length - 1].split(" ")[1]
        }, ${currentDate.getFullYear()})`,
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

  const sunglassesData = [];
  const prescriptionData = [];
  const blueLightData = [];

  const baseSunglassesData = [389, 245, 289, 312, 275, 356, 425];
  const basePrescriptionData = [298, 189, 225, 198, 234, 267, 289];
  const baseBlueLightData = [201, 167, 145, 178, 195, 212, 185];

  for (let i = 0; i <= currentDay; i++) {
    sunglassesData.push(baseSunglassesData[i]);
    prescriptionData.push(basePrescriptionData[i]);
    blueLightData.push(baseBlueLightData[i]);
  }

  const data = {
    labels: weekDays,
    datasets: [
      {
        label: "Sunglasses",
        data: sunglassesData,
        borderColor: "rgb(241, 188, 15)",
        backgroundColor: "rgba(241, 188, 15, 0.1)",
        tension: 0.4,
      },
      {
        label: "Prescription Glasses",
        data: prescriptionData,
        borderColor: "rgb(52, 152, 219)",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        tension: 0.4,
      },
      {
        label: "Blue Light Glasses",
        data: blueLightData,
        borderColor: "rgb(155, 89, 182)",
        backgroundColor: "rgba(155, 89, 182, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return <Line options={options} data={data} />;
};
