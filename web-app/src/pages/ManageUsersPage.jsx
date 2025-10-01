import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/ManageUsersPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
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
  const [staffList, setStaffList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [addStaffForm, setAddStaffForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    role: "staff_product", // Default role
  }); // Add status filter state - default to pending
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
        setStaffList([...response.data].reverse());
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setStaffList([]);
          showToast({ type: "info", message: "No staff found." });
        } else {
          console.error("Error fetching staff:", error);
        }
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/admin/user-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserList([...response.data].reverse());
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setUserList([]);
          showToast({ type: "info", message: "No users found." });
        } else {
          console.error("Error fetching users:", error);
        }
      }
    };
    fetchStaff();
    fetchUsers();
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
      setUserList([...response.data].reverse());
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
      setStaffList([...response.data].reverse());
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
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.isVerified ? "Verified" : "Unverified"}
                            </td>
                            <td>
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
                          <td>{staff.firstname || "N/A"}</td>
                          <td>{staff.lastname || "N/A"}</td>
                          <td>{staff.username}</td>
                          <td>{staff.email}</td>
                          <td>
                            {staff.role === "staff_order"
                              ? "Order Staff"
                              : staff.role === "staff_product"
                              ? "Product Staff"
                              : staff.role}
                          </td>
                          <td>
                            {staff.isVerified ? "Verified" : "Unverified"}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                staff.isDisabled ? "disabled" : "active"
                              }`}
                            >
                              {staff.isDisabled ? "Disabled" : "Active"}
                            </span>
                          </td>
                          <td>
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
