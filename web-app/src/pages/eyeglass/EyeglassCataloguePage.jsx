import React, { useState, useEffect } from "react";
import "../../styles/eyeglass/EyeglassCataloguePage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button.jsx";
import EyeglassPreview from "../../components/EyeglassPreview.jsx";
import axios from "axios";

const EyeglassCataloguePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const initialDeleteMode = location.state?.deleteMode || false;
  const [deleteMode, setDeleteMode] = useState(initialDeleteMode);
  const [eyeglasses, setEyeglasses] = useState([]);
  const [sortBy, setSortBy] = useState("latest");

  const handleAdd = () => navigate("/dashboard/addeyeglasses");

  const handleToggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleSort = (criteria) => {
    setSortBy(criteria);
    let sorted = [...eyeglasses];
    if (criteria === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (criteria === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (criteria === "price") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    setEyeglasses(sorted);
  };

  useEffect(() => {
    const fetchEyeglasses = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/productRoutes`);
        setEyeglasses(response.data.reverse());
      } catch (error) {}
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
                      className={`options-action-buttons ${
                        deleteMode ? "active-delete-button" : ""
                      }`}
                      onClick={handleToggleDeleteMode}
                      children={<p>Delete Pair</p>}
                    />
                  </div>
                  <div className="options-sorting">
                    <p>Sort By:</p>
                    <Button
                      className={`options-sort-buttons ${
                        sortBy === "latest" ? "active" : ""
                      }`}
                      onClick={() => handleSort("latest")}
                      children={<p>Latest</p>}
                    />
                    <Button
                      className={`options-sort-buttons ${
                        sortBy === "oldest" ? "active" : ""
                      }`}
                      onClick={() => handleSort("oldest")}
                      children={<p>Oldest</p>}
                    />
                    <Button
                      className={`options-sort-buttons ${
                        sortBy === "price" ? "active" : ""
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
              {/* bordered section here as well (scroll down ka sa cosmos landing page) */}
              <div className="selections-grid">
                {(Array.isArray(eyeglasses) ? eyeglasses : []).map(
                  (eyeglass) => (
                    <EyeglassPreview
                      key={eyeglass._id}
                      className="eyeglass-listing--catalogue"
                      deleteMode={deleteMode}
                      eyeglass={eyeglass}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EyeglassCataloguePage;
