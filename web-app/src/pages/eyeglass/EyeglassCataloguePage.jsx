import React, { useState, useEffect } from "react";
import "../../styles/eyeglass/EyeglassCataloguePage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button.jsx";
import EyeglassPreview from "../../components/EyeglassPreview.jsx";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCaretDown,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

const EyeglassCataloguePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const initialDeleteMode = location.state?.deleteMode || false;
  const [deleteMode, setDeleteMode] = useState(initialDeleteMode);
  const [eyeglasses, setEyeglasses] = useState([]);
  const [sortBy, setSortBy] = useState("latest");
  const [alertModal, setAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState("Delete");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [originalEyeglasses, setOriginalEyeglasses] = useState([]);


  const handleAdd = () => navigate("/dashboard/addeyeglasses");

  const handleToggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleSort = (criteria) => {
    setSortBy(criteria);
    let sorted = [...originalEyeglasses];
    if (criteria === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (criteria === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (criteria === "price") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    setEyeglasses(sorted);
  };

  /* const handleDeleteProduct = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;
    try {
      await axios.delete(`${SERVER_URL}/api/productRoutes?id=${id}`);
      setEyeglasses((prev) => prev.filter((e) => e._id !== id));
      alert("Product deleted successfully!");
    } catch (error) {
      alert("Failed to delete product.");
      console.error(error);
    }
  }; */

  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setAlertModal(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setAlertModal(false);
  };

  const handleDeleteProduct = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`${SERVER_URL}/api/productRoutes?id=${itemToDelete}`);
      setEyeglasses((prev) => prev.filter((e) => e._id !== itemToDelete));
      alert("Product deleted successfully!");
    } catch (error) {
      alert("Failed to delete product.");
      console.error(error);
    } finally {
      closeDeleteModal();
    }
  };


  useEffect(() => {
    const fetchEyeglasses = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/productRoutes`);
        const fetchedData = response.data.reverse();
        setOriginalEyeglasses(fetchedData);
        setEyeglasses(fetchedData);
      } catch (error) { }
    };

    fetchEyeglasses();
  }, []);

  return (
    <>
      <div className="page" id="catalogue">
        <div className="catalogue-content">
          <div className="catalogue-bulk">
            <div className="topbar">
              <div className="search">
                <div className="options">
                  <div className="options-cta">
                    <Button
                      className="options-action-buttons"
                      onClick={handleAdd}
                      children={<p>Add Pair</p>}
                    />
                    <Button
                      className={`options-action-buttons ${deleteMode ? "active-delete-button" : ""
                        }`}
                      onClick={handleToggleDeleteMode}
                      children={<p>Delete Pair</p>}
                    />
                  </div>
                  <div className="options-sorting">
                    <p>Sort By:</p>
                    <Button
                      className={`options-sort-buttons ${sortBy === "latest" ? "active" : ""
                        }`}
                      onClick={() => handleSort("latest")}
                      children={<p>Latest</p>}
                    />
                    <Button
                      className={`options-sort-buttons ${sortBy === "oldest" ? "active" : ""
                        }`}
                      onClick={() => handleSort("oldest")}
                      children={<p>Oldest</p>}
                    />
                    <Button
                      className={`options-sort-buttons ${sortBy === "price" ? "active" : ""
                        }`}
                      onClick={() => handleSort("price")}
                      children={<p>Price</p>}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="selections">
              {" "}
              <div className="selections-grid">
                {(Array.isArray(eyeglasses) ? eyeglasses : []).map(
                  (eyeglass) => (
                    <EyeglassPreview
                      key={eyeglass._id}
                      className="eyeglass-listing--catalogue"
                      deleteMode={deleteMode}
                      eyeglass={eyeglass}
                      onDelete={() => openDeleteModal(eyeglass._id)}
                    />
                  )
                )}
              </div>
            </div>


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
                    Delete Listing
                  </h2>
                  <li
                    className="action-li close"
                    onClick={() => closeDeleteModal()}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </li>
                </div>
                <div className="alert-modal-content-body">
                  {alertModalContent === "Delete" && (
                    <div className="amcb-delete">
                      <p>
                        You are about to <b>delete</b> this listing.
                      </p>
                      <br />
                      <p>
                        Deletion of product listings are permanent. This action is <b><u>NOT reversible</u></b> — once deleted, it is gone forever.
                      </p>
                    </div>
                  )}
                  <div className="amcb-continue-cta">
                    <p>
                      <i>Continue?</i>
                    </p>{" "}
                    <Button
                      onClick={() => { handleDeleteProduct(); }}
                      children={alertModalContent}
                      className={`button-component--alert`}
                    />
                    <Button
                      onClick={() => { closeDeleteModal() }}
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
        </div>
      </div>
    </>
  );
};

export default EyeglassCataloguePage;
