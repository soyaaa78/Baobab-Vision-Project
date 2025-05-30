import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import "../styles/ManageUsersPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCaretDown } from "@fortawesome/free-solid-svg-icons";
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
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [addStaffForm, setAddStaffForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
  });

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
        const response = await axios.get(`${SERVER_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        setOrderList(response.data);
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
                                  className={`action-li ${user.isDisabled ? "enable" : "disable"
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
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {console.log("modal:", modal, "modalContent:", modalContent)}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="manageusers-tab-content">
                <div>
                  <table className="muc-manageusers-table table-orders">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Item Name(s)</th>
                        <th>Specifications</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Ordered By (Username)</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderList.length === 0 ? (
                        <tr><td colSpan="11">No orders found.</td></tr>
                      ) : (
                        orderList.map((order) => {
                          console.log(order.items);
                          
                          return (
                            <React.Fragment key={order._id}>
                            <tr onClick={() => toggleExpandedOrder(order.id)}>
                              <td>{order.orderId}</td> {/* Order ID */}
                              <td>{order.date}</td> {/* Order Date */}
                              <td>{order.items.map(item => item.name).join(', ')}</td> {/* Item Name(s) */}
                              <td>{order.specifications}</td> {/* Specs */}
                              <td>{order.quantity}</td> {/* Qty */}
                              <td>PHP {order.price}</td> {/* Price */}
                              <td>{order.placedBy}</td> {/* Username */}
                              <td>{order.userEmail}</td> {/* Email */}
                              <td> {/* Order Status */}
                                <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                                  <option>Order Placed</option>
                                  <option>Processing</option>
                                  <option>Ready for Pickup</option>
                                  <option>Order Completed</option>
                                </select>
                              </td>
                              <td>{order.paymentMethod}</td>
                              <td> {/* Actions */}
                                <li className="action-li disable"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setModalContent("Edit");
                                    toggleModal();
                                  }
                                  }>
                                  Edit
                                </li>
                                <li className="action-li delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAlertModalContent("Delete");
                                    toggleAlertModal();
                                  }}
                                >
                                  Delete
                                </li>
                              </td>
                            </tr>

                            {expandedOrder === order.id && (
                              <tr className="order-details-row">
                                <td colSpan="10">
                                  <div className="order-details-container">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="order-item">
                                        <p><b>Item:</b> {item.name}</p>
                                        <p><b>Specs:</b> {item.specs}</p>
                                        <p><b>Qty:</b> {item.quantity}</p>
                                        <p><b>Price:</b> PHP {item.price}</p>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                          )
                        })
                      )}
                          
                    </tbody>

                  </table>

                  
                  {console.log("modal:", modal, "modalContent:", modalContent)}
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
                                className={`action-li ${staff.isDisabled ? "enable" : "disable"
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
                <div className="alert-modal-content-header">
                  <h2>{alertModalContent} User Account</h2>
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
                  )}

                  {alertModalContent === "Delete" && (
                    <div className="amcb-delete">
                      <p>
                        You are about to <b>delete</b> this staff account.
                      </p>
                      <br />
                      <p>
                        Deletion of accounts is permanent. This action is{" "}
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
                    </p>
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
                        }
                      }}
                      children={alertModalContent}
                      className={`button-component--alert ${alertModalContent === "Disable"
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
