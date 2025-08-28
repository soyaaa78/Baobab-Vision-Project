import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, ArcElement } from "chart.js";
import React, { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(Tooltip, ArcElement);

const PIE_COLORS = [
  "#FF6384", // Diamond
  "#36A2EB", // Oval
  "#FFCE56", // Triangle
  "#FFD166", // Heart
  "#4BC0C0", // Rectangle
  "#9966FF", // Round
  "#C9CBCF", // Square
  "#FF9F40", // Oblong
];

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
              backgroundColor: PIE_COLORS.slice(0, stats.length),
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

  // Ultra minimalist grid layout for stat boxes
  const statGrid = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "4px",
        marginTop: "16px",
        marginBottom: "4px",
        width: "100%",
        maxWidth: 520,
        alignSelf: "center",
      }}
    >
      {stats.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: "4px",
            padding: "8px 4px",
            textAlign: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: PIE_COLORS[idx % PIE_COLORS.length],
              margin: "0 auto 4px auto",
            }}
          />
          <div
            style={{
              fontSize: "0.65rem",
              fontWeight: 400,
              color: "#888",
              marginBottom: "1px",
              lineHeight: 1,
            }}
          >
            {item._id ? `${item._id}` : "Unknown"}
          </div>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 500,
              color: "#333",
              lineHeight: 1,
            }}
          >
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        padding: "16px 16px 12px 16px",
        maxWidth: 600,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: 280, height: 280, margin: "0 auto" }}>
        <Pie options={options} data={data} />
      </div>
      {statGrid}
    </div>
  );
};
