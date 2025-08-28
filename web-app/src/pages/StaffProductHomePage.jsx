import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";
import "../styles/StaffProductHomePage.css";
import EyeglassPreview from "../components/EyeglassPreview";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import { PieChart } from "../components/charts/Pie.jsx";
import {
  Plus,
  Package,
  TrendingUp,
  Eye,
  Star,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const StaffProductHomePage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [token, setToken] = useState();
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    newThisMonth: 0,
    avgRating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productData = response.data;
        setProducts(productData.slice(0, 6)); // Show latest 6 products

        // Calculate stats
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newThisMonth = productData.filter((product) => {
          const createdDate = new Date(product.createdAt);
          return (
            createdDate.getMonth() === currentMonth &&
            createdDate.getFullYear() === currentYear
          );
        }).length;

        setProductStats({
          totalProducts: productData.length,
          lowStockCount: productData.filter((p) => (p.stock || 0) < 10).length,
          newThisMonth: newThisMonth,
          avgRating: 4.2, // This would come from ratings API
        });
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [token, SERVER_URL]);

  const handleAddProduct = () => navigate("/dashboard/addeyeglasses");
  const handleManageProducts = () => navigate("/dashboard/catalogue");
  const handleStatistics = () => navigate("/dashboard/statistics");

  return (
    <div className="page" id="home">
      <div className="staff-product-content">
        <div className="dashboard-grid">
          {/* Stats Cards */}
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Package size={16} />
                </div>
                <div className="stat-content">
                  <h3>{productStats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">
                  <AlertCircle size={16} />
                </div>
                <div className="stat-content">
                  <h3>{productStats.lowStockCount}</h3>
                  <p>Low Stock Items</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">
                  <TrendingUp size={16} />
                </div>
                <div className="stat-content">
                  <h3>{productStats.newThisMonth}</h3>
                  <p>Added This Month</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">
                  <Star size={16} />
                </div>
                <div className="stat-content">
                  <h3>{productStats.avgRating.toFixed(1)}</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="recent-products">
            <div className="section-header">
              <h2>Recent Products</h2>
              <Button className="view-all-btn" onClick={handleManageProducts}>
                View All
              </Button>
            </div>
            <div className="products-grid">
              {products.map((product) => (
                <EyeglassPreview
                  key={product._id}
                  eyeglass={product}
                  className="product-preview-card"
                />
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="analytics-section">
            <div className="section-header">
              <h2>Product Analytics</h2>
              <Button className="view-all-btn" onClick={handleStatistics}>
                <TrendingUp size={16} />
                View Details
              </Button>
            </div>
            <div className="analytics-content">
              <div className="chart-container">
                <PieChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProductHomePage;
