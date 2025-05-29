import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, Tooltip, ArcElement } from "chart.js";

ChartJS.register(Tooltip, ArcElement);

const PieChart = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${SERVER_URL}/api/productRoutes/face-shape-stats`
        );
        const { stats, total } = res.data;
        const labels = stats.map((s) => s._id || "Unknown");
        const data = stats.map((s) => s.count);
        setChartData({
          labels,
          datasets: [
            {
              label: "Face Shape Distribution",
              data,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
                "#C9CBCF",
              ],
            },
          ],
          total,
        });
        setError(null);
      } catch (err) {
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!chartData) return null;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Pie
        data={chartData}
        options={{
          plugins: {
            legend: { display: true, position: "bottom" },
          },
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
};

export { PieChart };
