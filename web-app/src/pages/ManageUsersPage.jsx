import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import "../styles/ManageUsersPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCaretDown,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ManageUsersPage = () => {
  const TOKEN = localStorage.getItem("token");
  const ROLE = localStorage.getItem("role");
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [activeTab, setActiveTab] = useState("users");
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("Add New");
  const [alertModal, setAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState("Disable");
  const [dropdown, setDropdown] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffAction, setSelectedStaffAction] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [addStaffForm, setAddStaffForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
  }); // Add status filter state - default to pending
  const [selectedStatus, setSelectedStatus] = useState("pending");

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
      });
    }
  };

  const toggleExpandedOrder = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
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
            Authorization: `Bearer ${TOKEN}`,
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
              Authorization: `Bearer ${TOKEN}`,
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
  }, [SERVER_URL, TOKEN]);

  const handleUserAction = async (id, action) => {
    try {
      if (action === "Disable") {
        await axios.put(
          `${SERVER_URL}/api/admin/disable-user/${id}`,
          {},
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
      } else if (action === "Delete") {
        await axios.delete(`${SERVER_URL}/api/admin/delete-user/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
      } else if (action === "Enable") {
        await axios.put(
          `${SERVER_URL}/api/admin/enable-user/${id}`,
          {},
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
      }

      const response = await axios.get(`${SERVER_URL}/api/admin/user-list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      setUserList(response.data);
      toggleAlertModal();
    } catch (error) {
      console.error(`${action} user error:`, error);
    }
  };

  const handleStaffAction = async (id, action) => {
    try {
      if (action === "Disable") {
        await axios.put(
          `${SERVER_URL}/api/admin/disable-staff/${id}`,
          {},
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
      } else if (action === "Delete") {
        await axios.delete(`${SERVER_URL}/api/admin/delete-staff/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
      } else if (action === "Enable") {
        await axios.put(
          `${SERVER_URL}/api/admin/enable-staff/${id}`,
          {},
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
      }

      const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      setStaffList(response.data);
      toggleAlertModal();
    } catch (error) {
      console.error(`${action} staff error:`, error);
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
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      // Refresh orders list
      const response = await axios.get(`${SERVER_URL}/api/orders?index=true`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
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
    try {
      await axios.delete(`${SERVER_URL}/api/orders?id=${orderId}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      // Refresh orders list
      const response = await axios.get(`${SERVER_URL}/api/orders?index=true`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const orders = response.data.order || response.data;
      setOrderList(Array.isArray(orders) ? orders : [orders]);

      toggleAlertModal();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (
      !addStaffForm.firstname ||
      !addStaffForm.lastname ||
      !addStaffForm.username ||
      !addStaffForm.email ||
      !addStaffForm.password
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${SERVER_URL}/api/admin/create-staff`, addStaffForm, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      // Refresh staff list
      const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      setStaffList(response.data);

      toggleModal();
      alert("Staff member added successfully!");
    } catch (error) {
      console.error("Add staff error:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to add staff member");
      }
    }
  }; // Filter orders by selected status
  const getFilteredOrders = () => {
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
              <li
                className={
                  activeTab === "orders" ? "muc-link active" : "muc-link"
                }
                onClick={() => setActiveTab("orders")}
              >
                All Orders
              </li>
              {ROLE !== "admin" && (
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
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.isVerified ? "Verified" : "Unverified"}
                            </td>
                            <td>
                              <div className="td-action">
                                <li
                                  className={`action-li ${
                                    user.isDisabled ? "enable" : "disable"
                                  }`}
                                  onClick={() => {
                                    setSelectedUser(user._id);
                                    setSelectedAction(
                                      user.isDisabled ? "Enable" : "Disable"
                                    );
                                    setAlertModalContent(
                                      user.isDisabled ? "Enable" : "Disable"
                                    );
                                    toggleAlertModal();
                                  }}
                                >
                                  {user.isDisabled ? "Enable" : "Disable"}
                                </li>
                                <li
                                  className="action-li delete"
                                  onClick={() => {
                                    setSelectedUser(user._id);
                                    setSelectedAction("Delete");
                                    toggleAlertModal();
                                  }}
                                >
                                  Delete
                                </li>
                              </div>
                            </td>{" "}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>{" "}
                  {console.log("modal:", modal, "modalContent:", modalContent)}
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
                        <button
                          onClick={() => handleStatusChange("pending")}
                          className={`sort-btn ${
                            selectedStatus === "pending" ? "active" : ""
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange("paid")}
                          className={`sort-btn ${
                            selectedStatus === "paid" ? "active" : ""
                          }`}
                        >
                          Paid
                        </button>
                        <button
                          onClick={() => handleStatusChange("preparing")}
                          className={`sort-btn ${
                            selectedStatus === "preparing" ? "active" : ""
                          }`}
                        >
                          Preparing
                        </button>
                        <button
                          onClick={() => handleStatusChange("ready to pick up")}
                          className={`sort-btn ${
                            selectedStatus === "ready to pick up"
                              ? "active"
                              : ""
                          }`}
                        >
                          Ready to Pick Up
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
                          <th>Payment Method</th>
                          <th>Actions</th>
                        </tr>
                      </thead>{" "}
                      <tbody>
                        {orderList.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="no-data">
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
                                case "paid":
                                  return "status-badge paid";
                                case "preparing":
                                  return "status-badge preparing";
                                case "ready to pick up":
                                  return "status-badge ready";
                                default:
                                  return "status-badge default";
                              }
                            };

                            return (
                              <React.Fragment key={order._id}>
                                <tr
                                  onClick={() => toggleExpandedOrder(order._id)}
                                  className="order-row"
                                >
                                  <td className="order-id">
                                    {order._id.slice(-8)}...
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
                                      <option value="paid">Paid</option>
                                      <option value="preparing">
                                        Preparing
                                      </option>
                                      <option value="ready to pick up">
                                        Ready to Pick Up
                                      </option>
                                    </select>
                                  </td>
                                  <td>{order.paymentMethod || "N/A"}</td>
                                  <td>
                                    <button
                                      className="action-li delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedOrder(order._id);
                                        setSelectedAction("Delete");
                                        setAlertModalContent("Delete");
                                        toggleAlertModal();
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>

                                {expandedOrder === order._id && (
                                  <tr className="order-details-row">
                                    <td colSpan="9">
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
            {activeTab === "staff" && ROLE !== "admin" && (
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
                      <th>Actions</th>
                    </tr>
                  </thead>{" "}
                  <tbody>
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan="7">No staff found.</td>
                      </tr>
                    ) : (
                      staffList.map((staff) => (
                        <tr key={staff._id} className="table-tr">
                          <td>{staff.firstname || "N/A"}</td>
                          <td>{staff.lastname || "N/A"}</td>
                          <td>{staff.username}</td>
                          <td>{staff.email}</td>
                          <td>{staff.role}</td>
                          <td>
                            {staff.isVerified ? "Verified" : "Unverified"}
                          </td>
                          <td>
                            <div className="td-action">
                              <li
                                className={`action-li ${
                                  staff.isDisabled ? "enable" : "disable"
                                }`}
                                onClick={() => {
                                  setSelectedStaff(staff._id);
                                  setSelectedStaffAction(
                                    staff.isDisabled ? "Enable" : "Disable"
                                  );
                                  setAlertModalContent(
                                    staff.isDisabled ? "Enable" : "Disable"
                                  );
                                  toggleAlertModal();
                                }}
                              >
                                {staff.isDisabled ? "Enable" : "Disable"}
                              </li>
                              <li
                                className="action-li delete"
                                onClick={() => {
                                  setSelectedStaff(staff._id);
                                  setSelectedStaffAction("Delete");
                                  toggleAlertModal();
                                }}
                              >
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
            <div
              className={`alert-modal-container ${alertModal ? "active" : ""}`}
            >
              <div className={`modal-overlay ${alertModal ? "active" : ""}`} />
              <div
                className={`alert-modal-content ${alertModal ? "active" : ""}`}
              >
                {" "}
                <div className="alert-modal-content-header">
                  <h2>
                    {alertModalContent}{" "}
                    {activeTab === "orders"
                      ? "Order"
                      : activeTab === "staff"
                      ? "Staff Account"
                      : "User Account"}
                  </h2>
                  <li
                    className="action-li close"
                    onClick={() => toggleAlertModal()}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </li>
                </div>
                <div className="alert-modal-content-body">
                  {alertModalContent === "Disable" && (
                    <div className="amcb-disable">
                      <p>
                        You are about to <b>disable</b> this account.
                      </p>
                      <br />
                      <p>
                        Disabling this account will render it not usable or
                        accessible by the user unless re-enabled.
                      </p>
                      <br />
                      <p>
                        This action is <i>reversible</i> — you can reactivate
                        the account later if needed.
                      </p>
                    </div>
                  )}{" "}
                  {alertModalContent === "Delete" && (
                    <div className="amcb-delete">
                      <p>
                        You are about to <b>delete</b> this{" "}
                        {activeTab === "orders"
                          ? "order"
                          : activeTab === "staff"
                          ? "staff account"
                          : "user account"}
                        .
                      </p>
                      <br />
                      <p>
                        {activeTab === "orders"
                          ? "Deletion of orders is permanent. This action is"
                          : "Deletion of accounts is permanent. This action is"}{" "}
                        <b>
                          <u>NOT reversible</u>
                        </b>{" "}
                        — once deleted, it is gone forever.
                      </p>
                    </div>
                  )}
                  {alertModalContent === "Enable" && (
                    <div className="amcb-enable">
                      <p>
                        You are about to <b>enable</b> this account.
                      </p>
                      <br />
                      <p>
                        Enabling this account will allow the user or staff to
                        log in and access the system again.
                      </p>
                      <br />
                      <p>
                        This action is <i>reversible</i> — you can disable the
                        account again if needed.
                      </p>
                    </div>
                  )}
                  <div className="amcb-continue-cta">
                    <p>
                      <i>Continue?</i>
                    </p>{" "}
                    <Button
                      onClick={() => {
                        if (
                          activeTab === "users" &&
                          selectedUser &&
                          selectedAction
                        ) {
                          handleUserAction(selectedUser, selectedAction);
                        } else if (
                          activeTab === "staff" &&
                          selectedStaff &&
                          selectedStaffAction
                        ) {
                          handleStaffAction(selectedStaff, selectedStaffAction);
                        } else if (
                          activeTab === "orders" &&
                          selectedOrder &&
                          selectedAction === "Delete"
                        ) {
                          deleteOrder(selectedOrder);
                        }
                      }}
                      children={alertModalContent}
                      className={`button-component--alert ${
                        alertModalContent === "Disable"
                          ? "alert-disable"
                          : alertModalContent === "Delete"
                          ? "alert-delete"
                          : alertModalContent === "Enable"
                          ? "alert-enable"
                          : ""
                      }`}
                    />
                    <Button
                      onClick={toggleAlertModal}
                      className="button-component--alert"
                      children={
                        <div>
                          <p>Cancel</p>
                        </div>
                      }
                    />
                  </div>
                  {console.log(alertModalContent)}
                </div>
              </div>
            </div>
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
                          Upon addition, the user shall be sent a confirmation
                          email to confirm their identity.
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
