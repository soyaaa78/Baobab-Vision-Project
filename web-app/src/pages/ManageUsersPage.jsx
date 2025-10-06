import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/ManageUsersPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCaretDown,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { Check, Ban, Trash2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { showToast } from "../services/toastService";

const ManageUsersPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const ROLE = Cookies.get("role");
  const [activeTab, setActiveTab] = useState("users");
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("Add New");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    action: "",
    itemType: "",
    itemName: "",
    onConfirm: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [addStaffForm, setAddStaffForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    role: "staff_product", // Default role
  }); // Add status filter state - default to pending
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const openConfirmationModal = (
    action,
    itemType,
    itemName,
    onConfirm,
    userDetails = null
  ) => {
    setConfirmationModal({
      isOpen: true,
      action,
      itemType,
      itemName,
      onConfirm,
      userDetails,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: "",
      itemType: "",
      itemName: "",
      onConfirm: null,
    });
    setActionLoading(false);
  };

  const toggleAlertModal = () => {
    setAlertModal((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdown((prev) => !prev);
  };
  const toggleModal = () => {
    setModal((prev) => !prev);
    if (modal) {
      setAddStaffForm({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        role: "staff_product",
      });
    }
  };

  const toggleExpandedOrder = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const [token, setToken] = useState();

  // Load token on mount
  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return; // wait for token
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStaffList(response.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/admin/user-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserList(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
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
        // Handle the response structure - check if it's response.data.order or response.data
        const orders = response.data.order || response.data;
        setOrderList(Array.isArray(orders) ? orders : [orders]);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchStaff();
    fetchUsers();
    fetchOrders();
  }, [SERVER_URL, token]);

  const handleUserAction = async (id, action) => {
    setActionLoading(true);
    try {
      if (action === "Delete") {
        await axios.delete(`${SERVER_URL}/api/admin/delete-user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const response = await axios.get(`${SERVER_URL}/api/admin/user-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserList(response.data);
      closeConfirmationModal();
      showToast({
        message: `User ${action.toLowerCase()}d successfully`,
        type: "success",
      });
    } catch (error) {
      console.error(`${action} user error:`, error);
      showToast({
        message: `Failed to ${action.toLowerCase()} user`,
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStaffAction = async (id, action) => {
    setActionLoading(true);
    try {
      if (action === "Disable") {
        await axios.put(
          `${SERVER_URL}/api/admin/disable-staff/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (action === "Delete") {
        await axios.delete(`${SERVER_URL}/api/admin/delete-staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (action === "Enable") {
        await axios.put(
          `${SERVER_URL}/api/admin/enable-staff/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(response.data);
      closeConfirmationModal();
      showToast({
        message: `Staff ${action.toLowerCase()}d successfully`,
        type: "success",
      });
    } catch (error) {
      console.error(`${action} staff error:`, error);
      showToast({
        message: `Failed to ${action.toLowerCase()} staff`,
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddStaffInputChange = (e) => {
    const { name, value } = e.target;
    setAddStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add function to update order status
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

      // Refresh orders list
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

  // Add function to delete order
  const deleteOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await axios.delete(`${SERVER_URL}/api/orders?id=${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh orders list
      const response = await axios.get(`${SERVER_URL}/api/orders?index=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const orders = response.data.order || response.data;
      setOrderList(Array.isArray(orders) ? orders : [orders]);

      closeConfirmationModal();
      showToast({
        message: "Order deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast({
        message: "Failed to delete order",
        type: "error",
      });
      setActionLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (
      !addStaffForm.firstname ||
      !addStaffForm.lastname ||
      !addStaffForm.username ||
      !addStaffForm.email ||
      !addStaffForm.password ||
      !addStaffForm.role
    ) {
      showToast({
        message: "Please fill in all fields",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(`${SERVER_URL}/api/admin/create-staff`, addStaffForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh staff list
      const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(response.data);

      // Reset form
      setAddStaffForm({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        role: "staff_product",
      });

      toggleModal();
      showToast({
        message: "Staff member added successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Add staff error:", error);
      if (error.response?.data?.message) {
        showToast({
          message: error.response.data.message,
          type: "error",
          duration: 4000,
        });
      } else {
        showToast({
          message: "Failed to add staff member",
          type: "error",
          duration: 4000,
        });
      }
    }
  }; // Filter orders by selected status
  const getFilteredOrders = () => {
    if (selectedStatus === "all") return orderList;
    return orderList.filter((order) => order.status === selectedStatus);
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <>
      <div className="page" id="manageusers">
        <div className="manageusers-content">
          <div className="page-header">
            <h1>Manage Users</h1>
          </div>
          <div className="muc-selection-headers">
            <ul>
              <li
                className={
                  activeTab === "users" ? "muc-link active" : "muc-link"
                }
                onClick={() => setActiveTab("users")}
              >
                Users
              </li>

              {ROLE !== "staff_order" && (
                <li
                  className={
                    activeTab === "staff" ? "muc-link active" : "muc-link"
                  }
                  onClick={() => setActiveTab("staff")}
                >
                  Staff
                </li>
              )}
            </ul>
          </div>
          <div className="manageusers-tab-content-container">
            {activeTab === "users" && (
              <div className="manageusers-tab-content">
                <div>
                  <table className="muc-manageusers-table table-users">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Verification Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.length === 0 ? (
                        <tr>
                          <td colSpan="4">No users found.</td>
                        </tr>
                      ) : (
                        userList.map((user) => (
                          <tr key={user._id} className="table-tr">
                            <td data-label="Username">{user.username}</td>
                            <td data-label="Email">{user.email}</td>
                            <td data-label="Verification Status">
                              {user.isVerified ? "Verified" : "Unverified"}
                            </td>
                            <td data-label="Actions">
                              <div className="td-action">
                                <li
                                  className="action-li delete"
                                  onClick={() => {
                                    openConfirmationModal(
                                      "Delete",
                                      "User Account",
                                      null,
                                      () =>
                                        handleUserAction(user._id, "Delete"),
                                      user
                                    );
                                  }}
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </li>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>{" "}
                </div>
              </div>
            )}{" "}
            {activeTab === "orders" && (
              <div className="manageusers-tab-content">
                <div className="orders-container">
                  {" "}
                  {/* Status Filter Controls */}
                  <div className="sort-controls">
                    <div className="sort-controls-content">
                      <span className="sort-label">Filter by status:</span>
                      <div className="sort-buttons">
                        {" "}
                        <button
                          onClick={() => handleStatusChange("all")}
                          className={`sort-btn ${
                            selectedStatus === "all" ? "active" : ""
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => handleStatusChange("pending")}
                          className={`sort-btn ${
                            selectedStatus === "pending" ? "active" : ""
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange("processing")}
                          className={`sort-btn ${
                            selectedStatus === "processing" ? "active" : ""
                          }`}
                        >
                          Processing
                        </button>
                        <button
                          onClick={() => handleStatusChange("ready_to_pickup")}
                          className={`sort-btn ${
                            selectedStatus === "ready_to_pickup" ? "active" : ""
                          }`}
                        >
                          Ready to Pick Up
                        </button>
                        <button
                          onClick={() => handleStatusChange("completed")}
                          className={`sort-btn ${
                            selectedStatus === "completed" ? "active" : ""
                          }`}
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange("cancelled")}
                          className={`sort-btn ${
                            selectedStatus === "cancelled" ? "active" : ""
                          }`}
                        >
                          Cancelled
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange("cancelled_pending")
                          }
                          className={`sort-btn ${
                            selectedStatus === "cancelled_pending"
                              ? "active"
                              : ""
                          }`}
                        >
                          Cancelled Pending
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="table-wrapper">
                    <table className="orders-table">
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
                      </thead>{" "}
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
                            const customerEmail =
                              order.customer?.email || "N/A";

                            // Status badge styling
                            const getStatusBadge = (status) => {
                              switch (status) {
                                case "pending":
                                  return "status-badge pending";
                                case "processing":
                                  return "status-badge processing";
                                case "ready_to_pickup":
                                  return "status-badge ready";
                                case "completed":
                                  return "status-badge completed";
                                case "cancelled":
                                  return "status-badge cancelled";
                                case "cancelled_pending":
                                  return "status-badge cancelled-pending";
                                default:
                                  return "status-badge default";
                              }
                            };
                            const getStatusLabel = (status) => {
                              switch (status) {
                                case "ready_to_pickup":
                                  return "Ready to Pick Up";
                                case "cancelled_pending":
                                  return "Cancelled Pending";
                                default:
                                  return (
                                    status.charAt(0).toUpperCase() +
                                    status.slice(1)
                                  );
                              }
                            };

                            return (
                              <React.Fragment key={order._id}>
                                <tr
                                  onClick={() => toggleExpandedOrder(order._id)}
                                  className="order-row"
                                >
                                  <td className="order-id">
                                    {order.orderId ||
                                      `${order._id.slice(-8)}...`}
                                  </td>
                                  <td>{orderDate}</td>
                                  <td>{customerName}</td>
                                  <td className="customer-email">
                                    {customerEmail}
                                  </td>
                                  <td>
                                    <span className="product-count-badge">
                                      {order.products?.length > 0
                                        ? `${order.products.length} item(s)`
                                        : "No products"}
                                    </span>
                                  </td>
                                  <td className="total-amount">
                                    ₱{order.totalAmount}
                                  </td>
                                  <td>
                                    <select
                                      value={order.status}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(
                                          order._id,
                                          e.target.value
                                        );
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="status-select"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">
                                        Processing
                                      </option>
                                      <option value="ready_to_pickup">
                                        Ready to Pick Up
                                      </option>
                                      <option value="completed">
                                        Completed
                                      </option>
                                      <option value="cancelled">
                                        Cancelled
                                      </option>
                                      <option value="cancelled_pending">
                                        Cancelled Pending
                                      </option>
                                    </select>
                                  </td>
                                  <td>{order.deliveryMethod || "N/A"}</td>
                                  <td>{order.paymentMethod || "N/A"}</td>
                                  <td>
                                    <button
                                      className="action-li delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openConfirmationModal(
                                          "Delete",
                                          "Order",
                                          `Order #${
                                            order.orderId || order._id.slice(-8)
                                          }`,
                                          () => deleteOrder(order._id)
                                        );
                                      }}
                                    >
                                      <Trash2 size={14} />
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
                                                    order.date ||
                                                      order.createdAt
                                                  ).toLocaleString()}
                                                </span>
                                              </div>
                                              <div className="detail-item">
                                                <span className="detail-label">
                                                  Status:
                                                </span>
                                                <span
                                                  className={getStatusBadge(
                                                    order.status
                                                  )}
                                                >
                                                  {getStatusLabel(order.status)}
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
                                              Products (
                                              {order.products?.length || 0})
                                            </h4>
                                            <div className="products-list">
                                              {order.products?.map(
                                                (product, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="product-card"
                                                  >
                                                    <div className="product-info">
                                                      <div className="product-details">
                                                        <p className="product-name">
                                                          {product.productId
                                                            ?.name ||
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
                                                          Qty:{" "}
                                                          {product.quantity}
                                                        </p>
                                                        <p className="product-price">
                                                          ₱{product.price}
                                                        </p>
                                                        <p className="product-total">
                                                          ₱
                                                          {product.price *
                                                            product.quantity}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              ) || (
                                                <p className="no-products">
                                                  No products found
                                                </p>
                                              )}
                                            </div>
                                            <div className="order-total">
                                              <div className="total-row">
                                                <span className="total-label">
                                                  Total:
                                                </span>
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
                </div>
              </div>
            )}
            {activeTab === "staff" && (
              <div className="manageusers-tab-content">
                <Button
                  className="muc-add-users-btn"
                  onClick={() => (toggleModal(), setModalContent("Add Staff"))}
                  children={<p>New Staff</p>}
                />
                <table className="muc-manageusers-table table-users">
                  {" "}
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Verification Status</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>{" "}
                  <tbody>
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan="8">No staff found.</td>
                      </tr>
                    ) : (
                      staffList.map((staff) => (
                        <tr key={staff._id} className="table-tr">
                          <td data-label="First Name">
                            {staff.firstname || "N/A"}
                          </td>
                          <td data-label="Last Name">
                            {staff.lastname || "N/A"}
                          </td>
                          <td data-label="Username">{staff.username}</td>
                          <td data-label="Email">{staff.email}</td>
                          <td data-label="Role">{staff.role}</td>
                          <td data-label="Verification Status">
                            {staff.isVerified ? "Verified" : "Unverified"}
                          </td>
                          <td data-label="Account Status">
                            <span
                              className={`status-badge ${
                                staff.isDisabled ? "disabled" : "active"
                              }`}
                            >
                              {staff.isDisabled ? "Disabled" : "Active"}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <div className="td-action">
                              {staff.isDisabled ? (
                                <li
                                  className="action-li enable"
                                  onClick={() => {
                                    openConfirmationModal(
                                      "Enable",
                                      "Staff Account",
                                      null,
                                      () =>
                                        handleStaffAction(staff._id, "Enable"),
                                      staff
                                    );
                                  }}
                                >
                                  <Check size={14} />
                                  Enable
                                </li>
                              ) : (
                                <li
                                  className="action-li disable"
                                  onClick={() => {
                                    openConfirmationModal(
                                      "Disable",
                                      "Staff Account",
                                      null,
                                      () =>
                                        handleStaffAction(staff._id, "Disable"),
                                      staff
                                    );
                                  }}
                                >
                                  <Ban size={14} />
                                  Disable
                                </li>
                              )}
                              <li
                                className="action-li delete"
                                onClick={() => {
                                  openConfirmationModal(
                                    "Delete",
                                    "Staff Account",
                                    null,
                                    () =>
                                      handleStaffAction(staff._id, "Delete"),
                                    staff
                                  );
                                }}
                              >
                                <Trash2 size={14} />
                                Delete
                              </li>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* New Confirmation Modal */}
            <ConfirmationModal
              isOpen={confirmationModal.isOpen}
              onClose={closeConfirmationModal}
              onConfirm={confirmationModal.onConfirm}
              action={confirmationModal.action}
              itemType={confirmationModal.itemType}
              itemName={confirmationModal.itemName}
              userDetails={confirmationModal.userDetails}
              loading={actionLoading}
            />
            <div className={`modal-container ${modal ? "active" : ""}`}>
              <div className={`modal-overlay ${modal ? "active" : ""}`} />
              <div className={`modal-content ${modal ? "show" : ""}`}>
                <div className="modal-content-header">
                  <h2>{modalContent}</h2>
                  <li className="action-li close" onClick={() => toggleModal()}>
                    <FontAwesomeIcon icon={faXmark} />
                  </li>
                </div>

                <div className="modal-content-body">
                  {modal && modalContent === "Add Staff" && (
                    <div className="modal-body-container" id="add">
                      <div className="add-text">
                        <p>
                          Upon addition, the user account shall be created.{" "}
                          <br />
                          <br />
                          For them to fully use the administrator account, a
                          confirmation email shall be sent to the email
                          registered to confirm their identity and the validity
                          of the email.
                        </p>
                      </div>
                      <div className="mcb-body-container">
                        {" "}
                        <form
                          className="mcb-body"
                          id="add"
                          onSubmit={handleAddStaff}
                        >
                          <div
                            className="mu-modal-input modal-name"
                            id="abn-firstname"
                          >
                            <label htmlFor="firstname">First Name</label>
                            <input
                              type="text"
                              name="firstname"
                              id="firstname"
                              value={addStaffForm.firstname}
                              onChange={handleAddStaffInputChange}
                              required
                            />
                          </div>

                          <div
                            className="mu-modal-input modal-name"
                            id="abn-lastname"
                          >
                            <label htmlFor="lastname">Last Name</label>
                            <input
                              type="text"
                              name="lastname"
                              id="lastname"
                              value={addStaffForm.lastname}
                              onChange={handleAddStaffInputChange}
                              required
                            />
                          </div>

                          <div
                            className="mu-modal-input modal-name"
                            id="abn-username"
                          >
                            <label htmlFor="username">Username</label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              value={addStaffForm.username}
                              onChange={handleAddStaffInputChange}
                              required
                            />
                          </div>

                          <div className="mu-modal-input modal-email">
                            <label htmlFor="add-email">Email</label>
                            <input
                              type="email"
                              name="email"
                              id="add-email"
                              value={addStaffForm.email}
                              onChange={handleAddStaffInputChange}
                              required
                            />
                          </div>

                          <div className="mu-modal-input modal-password">
                            <label htmlFor="add-password">Password</label>
                            <input
                              type="password"
                              name="password"
                              id="add-password"
                              value={addStaffForm.password}
                              onChange={handleAddStaffInputChange}
                              required
                              minLength={6}
                            />
                          </div>

                          <div className="mu-modal-input modal-role">
                            <label htmlFor="add-role">Role</label>
                            <select
                              name="role"
                              id="add-role"
                              value={addStaffForm.role}
                              onChange={handleAddStaffInputChange}
                              required
                              className="role-select"
                            >
                              <option value="staff_product">
                                Product Staff
                              </option>
                              <option value="staff_order">Order Staff</option>
                            </select>
                          </div>
                        </form>
                      </div>{" "}
                      <Button
                        onClick={handleAddStaff}
                        children={
                          <div>
                            <p>Add Staff</p>
                          </div>
                        }
                      />
                    </div>
                  )}

                  {modal && modalContent === "Edit" && (
                    <div className="modal-body-container" id="edit">
                      <div className="mcb-body-container">
                        <form
                          className="mcb-body"
                          id="edit"
                          action=""
                          method="post"
                        >
                          <div
                            className="mu-modal-input modal-name"
                            id="ebn-firstname"
                          >
                            <label for="firstname">First Name</label>
                            <input
                              type="text"
                              name="firstname"
                              id="firstname"
                              value={"fn"}
                            />
                          </div>

                          <div
                            className="mu-modal-input modal-name"
                            id="ebn-lastname"
                          >
                            <label for="lastname">Last Name</label>
                            <input
                              type="text"
                              name="lastname"
                              id="lastname"
                              value={"ln"}
                            />
                          </div>

                          <div
                            className="mu-modal-input modal-name"
                            id="ebn-username"
                          >
                            <label for="username">Username</label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              value={"un"}
                            />
                          </div>

                          <div className="mu-modal-input modal-email">
                            <label for="edit-email">Email</label>
                            <input
                              type="email"
                              name="edit-email"
                              id="edit-email"
                              value={"email"}
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageUsersPage;
