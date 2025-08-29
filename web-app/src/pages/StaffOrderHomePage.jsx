import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";
import "../styles/StaffOrderHomePage.css";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Filter,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const StaffOrderHomePage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [token, setToken] = useState();
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [newUsers, setNewUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newThisWeek: 0,
    activeToday: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await axios.get(
          `${SERVER_URL}/api/orders?index=all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const orderData = ordersResponse.data.order;
        setOrders(orderData.slice(0, 5)); // Show latest 5 orders

        // Calculate order stats
        const totalOrders = orderData.length;
        const pendingOrders = orderData.filter((order) =>
          ["pending", "processing"].includes(order.status)
        ).length;
        const completedOrders = orderData.filter(
          (order) => order.status === "completed"
        ).length;
        const cancelledOrders = orderData.filter((order) =>
          ["cancelled", "cancelled_pending"].includes(order.status)
        ).length;
        const totalRevenue = orderData
          .filter((order) => order.status === "completed")
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const today = new Date().toDateString();
        const todayOrders = orderData.filter(
          (order) => new Date(order.createdAt).toDateString() === today
        ).length;

        setOrderStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue,
          todayOrders,
        });

        // Fetch users
        try {
          const usersResponse = await axios.get(
            `${SERVER_URL}/api/admin/user-list`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const userData = usersResponse.data || [];
          console.log("User data fetched:", userData); // Debug log

          // Get recent users (last 5)
          const sortedUsers = userData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setNewUsers(sortedUsers.slice(0, 5));

          // Calculate user stats
          const totalUsers = userData.length;
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const newThisWeek = userData.filter(
            (user) => new Date(user.createdAt) >= oneWeekAgo
          ).length;

          const activeToday = userData.filter(
            (user) =>
              user.lastLogin &&
              new Date(user.lastLogin).toDateString() === today
          ).length;

          console.log("User stats calculated:", {
            totalUsers,
            newThisWeek,
            activeToday,
          }); // Debug log

          setUserStats({
            totalUsers,
            newThisWeek,
            activeToday,
          });
        } catch (userError) {
          console.error("Error fetching users:", userError);
          // Set default values if user fetch fails
          setNewUsers([]);
          setUserStats({
            totalUsers: 0,
            newThisWeek: 0,
            activeToday: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token, SERVER_URL]);

  const handleManageOrders = () => navigate("/dashboard/allorders");
  const handleOrderAnalytics = () => navigate("/dashboard/order-analytics");
  const handleCustomers = () => navigate("/dashboard/manageusers");

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "processing":
        return <Package size={14} />;
      case "ready_to_pickup":
        return <CheckCircle size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "cancelled":
      case "cancelled_pending":
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "processing":
        return "#3b82f6";
      case "ready_to_pickup":
        return "#10b981";
      case "completed":
        return "#059669";
      case "cancelled":
      case "cancelled_pending":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="page" id="home">
      <div className="staff-order-content">
        <div className="dashboard-grid">
          {/* Stats Cards */}
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Package size={16} />
                </div>
                <div className="stat-content">
                  <h3>{orderStats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">
                  <Clock size={16} />
                </div>
                <div className="stat-content">
                  <h3>{orderStats.pendingOrders}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">
                  <CheckCircle size={16} />
                </div>
                <div className="stat-content">
                  <h3>{orderStats.completedOrders}</h3>
                  <p>Completed Orders</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">
                  <DollarSign size={16} />
                </div>
                <div className="stat-content">
                  <h3>
                    {formatCurrency(orderStats.totalRevenue).replace(
                      "PHP",
                      "₱"
                    )}
                  </h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="recent-orders">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Button className="view-all-btn" onClick={handleManageOrders}>
                <Eye size={16} />
                View All
              </Button>
            </div>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <div className="order-id">
                      #
                      {(
                        order.orderId || `${order._id.slice(-8)}...`
                      ).toUpperCase()}
                    </div>
                    <div className="customer-name">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </div>
                    <div className="order-date">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="order-details">
                    <div className="order-amount">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div
                      className="order-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)}
                      <span>
                        {order.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Users */}
          <div className="new-users-section">
            <div className="section-header">
              <h2>New Users</h2>
              <Button className="view-all-btn" onClick={handleCustomers}>
                <Users size={16} />
                View All
              </Button>
            </div>
            <div className="users-list">
              {newUsers.map((user) => (
                <div key={user._id} className="user-item">
                  <div className="user-avatar">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.firstName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-date">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <div className="user-status">
                    <div
                      className={`status-indicator ${
                        user.isActive ? "active" : "inactive"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              ))}
              {newUsers.length === 0 && (
                <div className="empty-state">
                  <Users size={32} />
                  <p>No new users found</p>
                </div>
              )}
            </div>
            <div className="user-stats-summary">
              <div className="summary-item">
                <span className="summary-label">Total Users</span>
                <span className="summary-value">{userStats.totalUsers}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">New This Week</span>
                <span className="summary-value">{userStats.newThisWeek}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Active Today</span>
                <span className="summary-value">{userStats.activeToday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffOrderHomePage;
