import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";
import EyeglassPreview from "../components/EyeglassPreview";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import { PieChart } from "../components/charts/Pie.jsx";
import { ProductViewsChart } from "../components/charts/ProductViewsChart.jsx";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const handleAdd = () => navigate("/dashboard/addeyeglasses");
  const handleCatalogue = () => navigate("/dashboard/catalogue");
  const handleDelete = () =>
    navigate("/dashboard/catalogue", { state: { deleteMode: true } });
  const handleStatistics = () => navigate("/dashboard/statistics");
  const [eyeglasses, setEyeglasses] = useState([]);

  useEffect(() => {
    const fetchEyeglasses = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/products/for-you`);
        setEyeglasses(response.data);
      } catch (error) {}
    };

    fetchEyeglasses();
  }, []);

  return (
    <>
      <div className="page" id="home">
        <div className="home-content">
          <div className="home-left">
            <div className="left-hero">
              <h1> ¿Cómo estás? </h1>
              <p>We aren't actually Spanish, the devs who made this.</p>
              <p>Or maybe we are? You never know ;)</p>

              <div className="hero-cta-buttons">
                <Button
                  className={"home-buttons"}
                  onClick={handleAdd}
                  children={<p>Add a New Pair</p>}
                />
                <Button
                  className={"home-buttons"}
                  onClick={handleDelete}
                  children={<p>Delete an Existing Pair</p>}
                />
                <Button
                  className={"home-buttons"}
                  onClick={handleCatalogue}
                  children={<p>Edit an Existing Pair</p>}
                />
              </div>
            </div>

            <div className="left-bottom">
              <div className="charts-container">
                <div className="chart-bg">
                  <div className="left-bottom-text">
                    <h2>Statistics</h2>
                    <p>
                      Your number-crunching digest, as usual. Care to take a
                      look?
                    </p>
                  </div>
                  <div className="charts">
                    <div className="home-chart-wrapper">
                      <PieChart width="325px" height="325px" />
                    </div>

                    <div className="home-chart-wrapper" id="productview">
                      <ProductViewsChart />
                    </div>
                  </div>

                  <div className="quip">
                    <p>Want to see more?</p>
                    <Button
                      className=""
                      onClick={handleStatistics}
                      children={<p>See Statistics</p>}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-right">
            <div className="catalogue-preview">
              <div className="cattext">
                <h2>Manage Eyeglass Selections</h2>
                <p>Got something to check out? Look no further.</p>
              </div>
              <div className="right-preview">
                <div className="preview-bg">
                  <div className="preview-items-container">
                    <div className="preview-items">
                      {(Array.isArray(eyeglasses)
                        ? eyeglasses.slice(0, 8)
                        : []
                      ).map((eyeglass) => (
                        <EyeglassPreview
                          key={eyeglass._id}
                          eyeglass={eyeglass}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="quip">
                    <p>Want to see more?</p>
                    <Button
                      className=""
                      onClick={handleCatalogue}
                      children={<p>See Full Catalogue</p>}
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

export default HomePage;
