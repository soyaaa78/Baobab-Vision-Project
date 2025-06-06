import React, { useState, useEffect } from "react";
import "../styles/StatisticsPage.css";
import { PieChart } from "../components/charts/Pie.jsx";
import { SalesLineChart } from "../components/charts/SalesLineChart.jsx";
import { ProductViewsChart } from "../components/charts/ProductViewsChart.jsx";
import placeholder from "../assets/placeholder.png";
import axios from "axios";

function StatisticsPage() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [mostBoughtProduct, setMostBoughtProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleDateString("en-US", {
    month: "short",
  });
  const currentDay = currentDate.getDate();
  const dayOfWeek = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const topRatedEyewear = {
    name: "LINDY",
    category: "Prescription Glasses",
    rating: 4.9,
    reviews: 11,
    price: 800,
    imageUrl:
      "https://baobabeyewear.com/cdn/shop/files/LINDY_-_1.0_Cover-No_Photocard.jpg?v=1746201927",
  };

  const mostVisitedEyewear = {
    name: "COVE",
    category: "Sunglasses",
    views: 152,
    price: 800,
    imageUrl:
      "https://baobabeyewear.com/cdn/shop/files/COVE_-_1.0_Cover-No_Photocard.jpg?v=1746201885",
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const orderStatsResponse = await axios.get(
          `${SERVER_URL}/api/productRoutes/order-stats?limit=1`
        );
        const { bestSellingProducts } = orderStatsResponse.data.data;

        if (bestSellingProducts && bestSellingProducts.length > 0) {
          setMostBoughtProduct(bestSellingProducts[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [SERVER_URL]);

  return (
    <>
      <div className="page" id="statistics">
        <div className="statistics-content">
          <div className="statistics-bulk">
            <div className="piesect">
              <div className="chart-wrapper" id="stat-piechart">
                <PieChart />
              </div>
            </div>
            <div className="linesect">
              <div className="chart-wrapper">
                <SalesLineChart />
                <p>
                  {currentYear} sales showing strong growth - {currentMonth}{" "}
                  {currentDay} current performance
                </p>
              </div>
              <div className="chart-wrapper">
                <ProductViewsChart />
                <p>
                  Product views for current week - {dayOfWeek} Update (
                  {currentMonth} {currentDay}, {currentYear})
                </p>
              </div>
            </div>
            <div className="viewsect">
              <div className="stat-content" id="view">
                <div className="stat-card">
                  <div className="stat-card-content">
                    <div className="content-text">
                      <p className="card-header">Most Visited Eyewear</p>
                      <p>{mostVisitedEyewear.name}</p>
                      <p>Views: {mostVisitedEyewear.views.toLocaleString()}</p>
                      <p>Category: {mostVisitedEyewear.category}</p>
                      <p>Price: ₱{mostVisitedEyewear.price}</p>
                    </div>

                    <div className="content-pic">
                      <img
                        src={mostVisitedEyewear.imageUrl}
                        alt={mostVisitedEyewear.name}
                      />
                    </div>
                  </div>{" "}
                </div>
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
                      <img
                        src={mostBoughtProduct?.imageUrls?.[0] || placeholder}
                        alt={mostBoughtProduct?.name || "Product"}
                      />
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-content">
                    <div className="content-text">
                      <p className="card-header">Top Rated This Month</p>
                      <p>{topRatedEyewear.name}</p>
                      <p>Rating: {topRatedEyewear.rating}/5.0 ⭐</p>
                      <p>Reviews: {topRatedEyewear.reviews.toLocaleString()}</p>
                      <p>Price: ₱{topRatedEyewear.price}</p>
                    </div>
                    <div className="content-pic">
                      <img
                        src={topRatedEyewear.imageUrl}
                        alt={topRatedEyewear.name}
                      />
                    </div>
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
