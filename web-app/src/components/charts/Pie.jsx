import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, ArcElement } from "chart.js";
import React, { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(Tooltip, ArcElement);

export const PieChart = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${SERVER_URL}/api/products/face-shape-stats`
        );
        const { stats } = res.data;
        setStats(stats);
        setData({
          labels: stats.map((s) => s._id || "Unknown"),
          datasets: [
            {
              label: "Face Shape",
              data: stats.map((s) => s.count),
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

  const options = {
    plugins: {
      legend: { display: true, position: "bottom" },
    },
    maintainAspectRatio: false,
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return null;

  return (
    <div
      style={{ width: 325, height: "auto", maxWidth: "100%", margin: "0 auto" }}
    >
      <div style={{ height: 325 }}>
        <Pie options={options} data={data} />
      </div>

      <div style={{ marginTop: "1em", textAlign: "center" }}>
        {stats.map((item, index) => (
          <p key={index}>
            <b>{item._id ? `${item._id} Shape` : "Unknown"}:</b> {item.count}
          </p>
        ))}
      </div>
    </div>
  );
};
