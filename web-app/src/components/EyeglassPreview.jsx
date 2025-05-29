import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/EyeglassPreview.css";
import placeholder from "../assets/placeholder.png";
import Button from "./Button";

// Accept eyeglass data as props
const EyeglassPreview = ({
  deleteMode = false,
  className = "",
  eyeglass,
  onDelete,
}) => {
  const navigate = useNavigate();
  const handleEdit = (id) => navigate(`/dashboard/editeyeglasses/${id}`);

  return (
    <>
      <Link
        to="/dashboard/eyeglasses"
        className={`eyeglass-listing ${className}`}
      >
        <div className="listing-content">
          <div className="bg">
            <div className="content-container">
              <div className="pic">
                <img
                  id="eyeglass-img"
                  src={eyeglass.imageUrls?.[0] || placeholder}
                  alt={eyeglass.name || "placeholder"}
                />
              </div>
              <div className="desc-container">
                <div className="eyeglass-descriptor">
                  <div className="eyeglass-name">
                    <h3>
                      <b>{eyeglass.name || "Eyeglass"}</b>
                    </h3>
                  </div>
                  <div className="eyeglass-buttons">
                    {deleteMode && (
                      <Button
                        className="button-component--listing delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete && onDelete(eyeglass._id);
                        }}
                        children={<p>Delete</p>}
                      />
                    )}
                    <Button
                      className="button-component--listing"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(eyeglass._id);
                      }}
                      children={<p>Edit</p>}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default EyeglassPreview;
