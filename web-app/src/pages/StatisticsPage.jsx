import React, { useState, useEffect } from "react";
import "../styles/StatisticsPage.css";
import Button from "../components/Button.jsx";
import { PieChart } from "../components/charts/Pie.jsx";
import { LineGraph } from "../components/charts/Line.jsx";
import placeholder from "../assets/placeholder.png";
import axios from "axios";

function StatisticsPage() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [mostBoughtProduct, setMostBoughtProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${SERVER_URL}/api/productRoutes/order-stats?limit=1`
        );
        const { bestSellingProducts } = response.data.data;

        if (bestSellingProducts && bestSellingProducts.length > 0) {
          setMostBoughtProduct(bestSellingProducts[0]);
        }
      } catch (err) {
        console.error("Error fetching order statistics:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, [SERVER_URL]);

  /* const [count, addCount] = useState(0);

    const handleAdding = () => {
        addCount(count + 1);
    } */

  return (
    <>
      <div className="page" id="statistics">
        <div className="statistics-content">
          <div className="statistics-bulk">
            <div className="piesect">
              <div className="chart-wrapper">
                <PieChart />
                <p>
                  Oval:{" "}
                  {/* ovaldata / totalusers raised limit to 2 decimals %*/}
                </p>
              </div>
            </div>

            <div className="linesect">
              <div className="chart-wrapper">
                <LineGraph />
                <p>
                  Oval:{" "}
                  {/* ovaldata / totalusers raised limit to 2 decimals %*/}
                </p>
              </div>
              <div className="chart-wrapper">
                <LineGraph />
                <p>
                  Oval:{" "}
                  {/* ovaldata / totalusers raised limit to 2 decimals %*/}
                </p>
              </div>
            </div>

            <div className="viewsect">
              <div className="stat-content" id="view">
                <div className="stat-card">
                  <div className="stat-card-content">
                    <div className="content-text">
                      <p className="card-header">Most Visited Eyewear</p>
                      <p>reid</p>
                    </div>

                    <div className="content-pic">
                      {" "}
                      {/* make responsive */}
                      <img src={placeholder} alt="" />
                    </div>
                  </div>
                </div>{" "}
                <div className="stat-card">
                  <div className="stat-card-content">
                    <div className="content-text">
                      <p className="card-header">Most Bought Product</p>
                      {loading ? (
                        <p>Loading...</p>
                      ) : error ? (
                        <p>Failed to load</p>
                      ) : mostBoughtProduct ? (
                        <>
                          <p>{mostBoughtProduct.name}</p>
                          <p>Sales: {mostBoughtProduct.sales}</p>
                          <p>Price: ₱{mostBoughtProduct.price}</p>
                        </>
                      ) : (
                        <p>No data available</p>
                      )}
                    </div>

                    <div className="content-pic">
                      {" "}
                      {/* make responsive */}
                      <img
                        src={mostBoughtProduct?.imageUrls?.[0] || placeholder}
                        alt={mostBoughtProduct?.name || "Product"}
                      />
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-content">
                    <p className="card-header">Placeholder 2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StatisticsPage;
