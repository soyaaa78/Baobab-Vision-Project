import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import "../styles/AllOrdersPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Trash2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const AllOrdersPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [alertModal, setAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState("Delete");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [token, setToken] = useState();

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/orders?index=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orders = response.data.order || response.data;
        setOrderList(Array.isArray(orders) ? orders : [orders]);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [SERVER_URL, token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${SERVER_URL}/api/orders?id=${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await axios.get(`${SERVER_URL}/api/orders?index=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const orders = response.data.order || response.data;
      setOrderList(Array.isArray(orders) ? orders : [orders]);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`${SERVER_URL}/api/orders?id=${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await axios.get(`${SERVER_URL}/api/orders?index=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const orders = response.data.order || response.data;
      setOrderList(Array.isArray(orders) ? orders : [orders]);
      setAlertModal(false);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const getFilteredOrders = () => {
    if (selectedStatus === "all") return orderList;
    return orderList.filter((order) => order.status === selectedStatus);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const toggleExpandedOrder = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="page" id="allorders">
      <div className="allorders-header">
        <h1>All Orders</h1>
        <p>Manage and track all customer orders</p>
      </div>

      {/* Filter Section */}
      <div className="allorders-filter-section">
        <span className="filter-label">Filter by status:</span>
        <div className="filter-buttons">
          <button
            onClick={() => handleStatusChange("all")}
            className={`filter-btn ${selectedStatus === "all" ? "active" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusChange("pending")}
            className={`filter-btn ${
              selectedStatus === "pending" ? "active" : ""
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusChange("processing")}
            className={`filter-btn ${
              selectedStatus === "processing" ? "active" : ""
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => handleStatusChange("ready_to_pickup")}
            className={`filter-btn ${
              selectedStatus === "ready_to_pickup" ? "active" : ""
            }`}
          >
            Ready to Pick Up
          </button>
          <button
            onClick={() => handleStatusChange("completed")}
            className={`filter-btn ${
              selectedStatus === "completed" ? "active" : ""
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => handleStatusChange("cancelled")}
            className={`filter-btn ${
              selectedStatus === "cancelled" ? "active" : ""
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => handleStatusChange("cancelled_pending")}
            className={`filter-btn ${
              selectedStatus === "cancelled_pending" ? "active" : ""
            }`}
          >
            Cancelled Pending
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="allorders-table-container">
        <table className="allorders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Date</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Delivery Method</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderList.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  No orders found.
                </td>
              </tr>
            ) : (
              getFilteredOrders().map((order) => {
                const orderDate = new Date(
                  order.date || order.createdAt
                ).toLocaleDateString();
                const customerName = order.customer
                  ? `${order.customer.firstname} ${order.customer.lastname}`
                  : "N/A";
                const customerEmail = order.customer?.email || "N/A";

                return (
                  <React.Fragment key={order._id}>
                    <tr
                      onClick={() => toggleExpandedOrder(order._id)}
                      className="order-row"
                    >
                      <td className="order-id-cell">
                        {order._id.slice(-8)}...
                      </td>
                      <td>{orderDate}</td>
                      <td>{customerName}</td>
                      <td className="customer-email">{customerEmail}</td>
                      <td>
                        <span className="product-badge">
                          {order.products?.length > 0
                            ? `${order.products.length} item(s)`
                            : "No products"}
                        </span>
                      </td>
                      <td className="total-amount">₱{order.totalAmount}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order._id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="status-dropdown"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="ready_to_pickup">
                            Ready to Pick Up
                          </option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="cancelled_pending">
                            Cancelled Pending
                          </option>
                        </select>
                      </td>
                      <td>{order.deliveryMethod || "N/A"}</td>
                      <td>{order.paymentMethod || "N/A"}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order._id);
                            setSelectedAction("Delete");
                            setAlertModalContent("Delete");
                            setAlertModal(true);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expandedOrder === order._id && (
                      <tr className="order-details-row">
                        <td colSpan="10">
                          <div className="order-details-panel">
                            <div className="order-details-grid">
                              <div className="order-info-section">
                                <h4 className="section-title">
                                  <svg
                                    className="section-icon"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                  </svg>
                                  Order Details
                                </h4>
                                <div className="detail-list">
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Address:
                                    </span>
                                    <span className="detail-value">
                                      {order.address || "N/A"}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Contact:
                                    </span>
                                    <span className="detail-value">
                                      {order.contactNumber || "N/A"}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Order Date:
                                    </span>
                                    <span className="detail-value">
                                      {new Date(
                                        order.date || order.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Status:
                                    </span>
                                    <span className="detail-value">
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="products-section">
                                <h4 className="section-title">
                                  <svg
                                    className="section-icon"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                  </svg>
                                  Products ({order.products?.length || 0})
                                </h4>
                                <div className="products-list">
                                  {order.products?.map((product, idx) => (
                                    <div key={idx} className="product-card">
                                      <div className="product-info">
                                        <div className="product-details">
                                          <p className="product-name">
                                            {product.productId?.name ||
                                              "Unknown Product"}
                                          </p>
                                          <p className="product-spec">
                                            Color: {product.color}
                                          </p>
                                          <p className="product-spec">
                                            Lens: {product.lens}
                                          </p>
                                        </div>
                                        <div className="product-pricing">
                                          <p className="product-qty">
                                            Qty: {product.quantity}
                                          </p>
                                          <p className="product-price">
                                            ₱{product.price}
                                          </p>
                                          <p className="product-total">
                                            ₱{product.price * product.quantity}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )) || (
                                    <p className="no-products">
                                      No products found
                                    </p>
                                  )}
                                </div>
                                <div className="order-total">
                                  <div className="total-row">
                                    <span className="total-label">Total:</span>
                                    <span className="total-value">
                                      ₱{order.totalAmount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Alert Modal for Delete */}
      <div className={`alert-modal-container ${alertModal ? "active" : ""}`}>
        <div className={`modal-overlay ${alertModal ? "active" : ""}`} />
        <div className={`alert-modal-content ${alertModal ? "active" : ""}`}>
          <div className="alert-modal-content-header">
            <h2>Delete Order</h2>
            <li
              className="action-li close"
              onClick={() => setAlertModal(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </li>
          </div>
          <div className="alert-modal-content-body">
            <div className="amcb-delete">
              <p>
                You are about to <b>delete</b> this order.
              </p>
              <br />
              <p>
                Deletion of orders is permanent. This action is
                <b>
                  <u> NOT reversible</u>
                </b>{" "}
                — once deleted, it is gone forever.
              </p>
            </div>
            <div className="amcb-continue-cta">
              <p>
                <i>Continue?</i>
              </p>
              <Button
                onClick={() => {
                  if (selectedOrder && selectedAction === "Delete") {
                    deleteOrder(selectedOrder);
                  }
                }}
                children={alertModalContent}
                className="button-component--alert alert-delete"
              />
              <Button
                onClick={() => setAlertModal(false)}
                className="button-component--alert"
                children={
                  <div>
                    <p>Cancel</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrdersPage;
