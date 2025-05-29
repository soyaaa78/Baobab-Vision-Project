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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffAction, setSelectedStaffAction] = useState(null);

  const toggleAlertModal = () => {
    setAlertModal((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdown((prev) => !prev);
  };

  const toggleModal = () => {
    setModal((prev) => !prev);
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
    fetchStaff();
    fetchUsers();
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
      // Refresh user list
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
      // Refresh staff list
      const response = await axios.get(`${SERVER_URL}/api/admin/staff-list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      setStaffList(response.data);
      toggleAlertModal();
    } catch (error) {
      console.error(`${action} staff error:`, error);
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
            {activeTab === "staff" && ROLE !== "admin" && (
              <div className="manageusers-tab-content">
                <Button
                  className="muc-add-users-btn"
                  onClick={() => (toggleModal(), setModalContent("Add New"))}
                  children={<p>New User</p>}
                />
                <table className="muc-manageusers-table table-users">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Verification Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan="6">No staff found.</td>
                      </tr>
                    ) : (
                      staffList.map((staff) => (
                        <tr key={staff._id} className="table-tr">
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
                  <h2>{modalContent} User</h2>
                  <li className="action-li close" onClick={() => toggleModal()}>
                    <FontAwesomeIcon icon={faXmark} />
                  </li>
                </div>

                <div className="modal-content-body">
                  {modal && modalContent === "Add New" && (
                    <div className="modal-body-container" id="add">
                      <div className="add-text">
                        <p>
                          Upon addition, the user shall be sent a confirmation
                          email to confirm their identity.
                        </p>
                      </div>

                      <div className="mcb-body-container">
                        <form
                          className="mcb-body"
                          id="add"
                          action=""
                          method="post"
                        >
                          <div
                            className="mu-modal-input modal-name"
                            id="abn-firstname"
                          >
                            <label for="firstname">First Name</label>
                            <input
                              type="text"
                              name="firstname"
                              id="firstname"
                            />
                          </div>

                          <div
                            className="mu-modal-input modal-name"
                            id="abn-lastname"
                          >
                            <label for="lastname">Last Name</label>
                            <input type="text" name="lastname" id="lastname" />
                          </div>

                          <div
                            className="mu-modal-input modal-name"
                            id="abn-username"
                          >
                            <label for="username">Username</label>
                            <input type="text" name="username" id="username" />
                          </div>

                          <div className="mu-modal-input modal-email">
                            <label for="add-email">Email</label>
                            <input
                              type="email"
                              name="add-email"
                              id="add-email"
                            />
                          </div>
                        </form>
                      </div>

                      <Button
                        /* onClick={} */ children={
                          <div>
                            <p>Add User</p>
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
