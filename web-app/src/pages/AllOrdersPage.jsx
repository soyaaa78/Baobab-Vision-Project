import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ToastContainer from "../components/ToastContainer";
import { showToast } from "../services/toastService";
import Button from "../components/Button";
import ProofOfPaymentModal from "../components/ProofOfPaymentModal";
import PickupDetailsModal from "../components/PickupDetailsModal";
import CancellationModal from "../components/CancellationModal";
import DeleteOrderModal from "../components/DeleteOrderModal";
import "../styles/AllOrdersPage.css";
import { Trash2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  ready_for_shipment: "Ready for Shipment",
  in_transit: "In Transit",
  ready_to_pickup: "Ready to Pick Up",
  completed: "Completed",
  cancelled: "Cancelled",
  cancelled_pending: "Pending Cancelled Orders",
};

const AllOrdersPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [orderList, setOrderList] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const location = useLocation();
  const urlScope = useMemo(
    () => new URLSearchParams(location.search).get("scope"),
    [location.search]
  );
  const headerTitle = useMemo(() => {
    switch (urlScope) {
      case "pickup":
        return "Pickup Orders";
      case "third":
        return "Third Party Orders";
      default:
        return "All Orders";
    }
  }, [urlScope]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [token, setToken] = useState();
  const [proofOfPaymentModal, setProofOfPaymentModal] = useState(false);
  const [selectedProofOfPayment, setSelectedProofOfPayment] = useState(null);
  const [selectedProofOrder, setSelectedProofOrder] = useState(null);
  const [cancellationModal, setCancellationModal] = useState(false);
  const [selectedCancellationOrder, setSelectedCancellationOrder] =
    useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupTargetOrder, setPickupTargetOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helpers
  const getOrderLabel = (order) =>
    order?.orderId || `Order ${order?._id?.slice(-8)}`;
  const statusLabel = (s) => STATUS_LABELS[s] || s;

  const statusFilters = useMemo(() => {
    const base = [
      { value: "pending", label: STATUS_LABELS.pending },
      { value: "processing", label: STATUS_LABELS.processing },
    ];

    if (urlScope === "third") {
      return [
        ...base,
        { value: "ready_for_shipment", label: STATUS_LABELS.ready_for_shipment },
        { value: "in_transit", label: STATUS_LABELS.in_transit },
        { value: "completed", label: STATUS_LABELS.completed },
        {
          value: "cancelled_pending",
          label: STATUS_LABELS.cancelled_pending,
        },
        { value: "cancelled", label: STATUS_LABELS.cancelled },
      ];
    }

    if (urlScope === "pickup") {
      return [
        ...base,
        { value: "ready_to_pickup", label: STATUS_LABELS.ready_to_pickup },
        { value: "completed", label: STATUS_LABELS.completed },
        {
          value: "cancelled_pending",
          label: STATUS_LABELS.cancelled_pending,
        },
        { value: "cancelled", label: STATUS_LABELS.cancelled },
      ];
    }

    return [
      ...base,
      { value: "ready_for_shipment", label: STATUS_LABELS.ready_for_shipment },
      { value: "in_transit", label: STATUS_LABELS.in_transit },
      { value: "ready_to_pickup", label: STATUS_LABELS.ready_to_pickup },
      { value: "completed", label: STATUS_LABELS.completed },
      {
        value: "cancelled_pending",
        label: STATUS_LABELS.cancelled_pending,
      },
      { value: "cancelled", label: STATUS_LABELS.cancelled },
    ];
  }, [urlScope]);

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  // Update browser tab title to match page title
  useEffect(() => {
    document.title = headerTitle;
  }, [headerTitle]);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${SERVER_URL}/api/orders?index=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ordersRaw = response.data.order || response.data;
        const orders = Array.isArray(ordersRaw)
          ? [...ordersRaw].reverse()
          : [ordersRaw];
        setOrderList(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [SERVER_URL, token]);

  const updateOrderStatus = async (orderId, newStatus, extra = {}) => {
    try {
      await axios.put(
        `${SERVER_URL}/api/orders?id=${orderId}`,
        { status: newStatus, ...extra },
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
      let ordersRaw = response.data.order || response.data;
      let orders = Array.isArray(ordersRaw)
        ? [...ordersRaw].reverse()
        : [ordersRaw];
      // Move the updated order to the top of its new status group (in reversed list)
      const updatedIdx = orders.findIndex((o) => o._id === orderId);
      if (updatedIdx !== -1) {
        const [updatedOrder] = orders.splice(updatedIdx, 1);
        // Find the first index with the same status, or top if none
        let insertIdx = orders.findIndex((o) => o.status === newStatus);
        if (insertIdx === -1) insertIdx = 0;
        orders.splice(insertIdx, 0, updatedOrder);
      }
      setOrderList(orders);
      const ord = orders.find((o) => o._id === orderId);
      const reasonSuffix =
        newStatus === "cancelled" &&
        (extra?.cancellationReason || extra?.declineReason)
          ? ` Reason: ${extra.cancellationReason || extra.declineReason}`
          : "";
      showToast({
        type: "success",
        message: `${getOrderLabel(ord)} has been marked as ${statusLabel(
          newStatus
        )}.${reasonSuffix}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast({
        type: "error",
        message: "Failed to update the order status. Please try again.",
      });
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      // capture label before deletion
      const current = orderList.find((o) => o._id === orderId);
      const label = getOrderLabel(current);

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
      const ordersRaw = response.data.order || response.data;
      const orders = Array.isArray(ordersRaw)
        ? [...ordersRaw].reverse()
        : [ordersRaw];
      setOrderList(orders);
      showToast({ type: "success", message: `${label} has been deleted.` });
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast({
        type: "error",
        message: "Failed to delete the order. Please try again.",
      });
    }
  };

  const getFilteredOrders = () => {
    let base = orderList;
    // Scope filter from navbar dropdown
    if (urlScope === "pickup") {
      base = base.filter((o) => o.deliveryMethod === "Pick Up");
    } else if (urlScope === "third") {
      base = base.filter((o) => o.deliveryMethod === "Third-Party Delivery");
    }
    // Filter by status
    if (selectedStatus === "all") {
      return base;
    }
    return base.filter((order) => order.status === selectedStatus);
  };

  // Always default to 'All' when switching scopes or opening the page
  useEffect(() => {
    setSelectedStatus("all");
  }, [urlScope]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const toggleExpandedOrder = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  // Compute next status in lifecycle
  const getStatusFlow = (order) => {
    if (order.deliveryMethod === "Third-Party Delivery") {
      return [
        "pending",
        "processing",
        "ready_for_shipment",
        "in_transit",
        "completed",
      ];
    }

    return ["pending", "processing", "ready_to_pickup", "completed"];
  };

  const getNextStatus = (order) => {
    const flow = getStatusFlow(order);
    const i = flow.indexOf(order.status);
    if (i === -1 || i === flow.length - 1) return null;
    return flow[i + 1];
  };

  const getProgressLabel = (order, nextStatus) => {
    switch (nextStatus) {
      case "processing":
        return "Mark as Processing";
      case "ready_for_shipment":
        return "Mark as Ready for Shipment";
      case "in_transit":
        return "Mark as In Transit";
      case "ready_to_pickup":
        return "Mark as Ready to Pick Up";
      case "completed":
        return "Mark as Completed";
      default:
        return "Progress";
    }
  };

  const getStatusOptionsForOrder = (order) => {
    const flow = getStatusFlow(order);
    const values = Array.from(
      new Set([...flow, "cancelled_pending", "cancelled", order.status].filter(Boolean))
    );
    return values.map((value) => ({
      value,
      label: statusLabel(value),
    }));
  };

  if (loading) {
    return (
      <div className="page" id="allorders">
        <div className="allorders-header">
          <h1>All Orders</h1>
          <p>Manage and track all customer orders</p>
        </div>
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
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton" style={{ width: '70px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '80px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '100px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '130px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '50px', height: '22px', borderRadius: '12px' }} /></td>
                  <td><div className="skeleton" style={{ width: '60px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '90px', height: '22px', borderRadius: '12px' }} /></td>
                  <td><div className="skeleton" style={{ width: '80px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '80px', height: '16px' }} /></td>
                  <td><div className="skeleton" style={{ width: '100px', height: '30px', borderRadius: '6px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="allorders">
      <ToastContainer />
      <div className="allorders-header">
        <h1>{headerTitle}</h1>
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
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              className={`filter-btn ${
                selectedStatus === filter.value ? "active" : ""
              }`}
            >
              {filter.label}
            </button>
          ))}
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
            {(() => {
              const filtered = getFilteredOrders();
              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No orders found.
                    </td>
                  </tr>
                );
              }
              return filtered.map((order) => {
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
                        {order.orderId || `${order._id.slice(-8)}...`}
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
                          {getStatusOptionsForOrder(order).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {order.deliveryMethod === "Third-Party Delivery" &&
                        order.thirdPartyDelivery
                          ? `Third-Party Delivery (${order.thirdPartyDelivery})`
                          : order.deliveryMethod || "N/A"}
                      </td>
                      <td>{order.paymentMethod || "N/A"}</td>
                      <td>
                        <div className="action-buttons">
                          {order.proofOfPayment && (
                            <button
                              className="proof-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProofOfPayment(order.proofOfPayment);
                                setSelectedProofOrder(order);
                                setProofOfPaymentModal(true);
                              }}
                            >
                              View Proof
                            </button>
                          )}
                          {order.status === "cancelled_pending" && (
                            <button
                              className="cancellation-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCancellationOrder(order);
                                setCancellationModal(true);
                              }}
                            >
                              View Cancellation Reason
                            </button>
                          )}
                          {(() => {
                            const next = getNextStatus(order);
                            if (!next) return null; // hide default
                            const label = getProgressLabel(order, next);
                            const isProcessingToReady =
                              order.status === "processing" &&
                              order.deliveryMethod === "Pick Up";
                            if (isProcessingToReady) {
                              return (
                                <button
                                  className="proof-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPickupTargetOrder(order);
                                    setPickupModalOpen(true);
                                  }}
                                  title={label}
                                >
                                  {label}
                                </button>
                              );
                            }
                            return (
                              <button
                                className="proof-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order._id, next);
                                }}
                                title={label}
                              >
                                {label}
                              </button>
                            );
                          })()}
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProofOrder(order); // reuse for modal summary
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
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
                                  {order.address && (
                                    <div className="detail-item">
                                      <span className="detail-label">
                                        Address:
                                      </span>
                                      <span className="detail-value">
                                        {`${order.address.addressDetails}, ${order.address.barangay}, ${order.address.city}, ${order.address.province}, ${order.address.region} ${order.address.postalCode}`}
                                      </span>
                                    </div>
                                  )}
                                  {order.contactNumber && (
                                    <div className="detail-item">
                                      <span className="detail-label">
                                        Contact:
                                      </span>
                                      <span className="detail-value">
                                        {order.contactNumber || "N/A"}
                                      </span>
                                    </div>
                                  )}
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
                                      Delivery Method:
                                    </span>
                                    <span className="detail-value">
                                      {order.deliveryMethod ===
                                        "Third-Party Delivery" &&
                                      order.thirdPartyDelivery
                                        ? `Third-Party Delivery (${order.thirdPartyDelivery})`
                                        : order.deliveryMethod || "N/A"}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Status:
                                    </span>
                                    <span className="detail-value">
                                      {statusLabel(order.status)}
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
                                  {order.products?.map((product, idx) => {
                                    // Find color and lens options
                                    const selectedColor =
                                      product.productId?.colorOptions?.find(
                                        (color) => color._id === product.color
                                      );
                                    const selectedLens =
                                      product.productId?.lensOptions?.find(
                                        (lens) => lens._id === product.lens
                                      );

                                    return (
                                      <div key={idx} className="product-card">
                                        <div className="product-info">
                                          <div className="product-details">
                                            <p className="product-name">
                                              {product.productId?.name ||
                                                "Unknown Product"}
                                            </p>
                                            <p className="product-spec">
                                              Color:{" "}
                                              {selectedColor?.name ||
                                                "Unknown Color"}
                                            </p>
                                            <p className="product-spec">
                                              Lens:{" "}
                                              {selectedLens?.label ||
                                                "Unknown Lens"}
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
                                              ₱
                                              {product.price * product.quantity}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }) || (
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
                              {order.rating && (
                                <div className="rating-section">
                                  <h4 className="section-title">
                                    Customer Feedback
                                  </h4>
                                  <div className="detail-list">
                                    <div className="detail-item">
                                      <span className="detail-label">
                                        Rating:
                                      </span>
                                      <span className="detail-value">
                                        {order.rating.rating}/5
                                      </span>
                                    </div>
                                    {order.rating.comment && (
                                      <div className="detail-item">
                                        <span className="detail-label">
                                          Comment:
                                        </span>
                                        <span className="detail-value">
                                          {order.rating.comment}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {Array.isArray(order.rating.pictures) &&
                                    order.rating.pictures.length > 0 && (
                                      <div className="rating-pictures">
                                        {order.rating.pictures.map(
                                          (url, idx) => (
                                            <a
                                              key={idx}
                                              href={url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="rating-picture-link"
                                            >
                                              <img
                                                src={url}
                                                alt={`rating-${idx + 1}`}
                                                className="rating-picture"
                                              />
                                            </a>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Delete Order Modal */}
      <DeleteOrderModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        order={selectedProofOrder}
        onDelete={async (id) => {
          await deleteOrder(id);
          setDeleteModalOpen(false);
        }}
      />

      {/* Proof of Payment Modal */}
      <ProofOfPaymentModal
        isOpen={proofOfPaymentModal}
        onClose={() => setProofOfPaymentModal(false)}
        proofOfPayment={selectedProofOfPayment}
        order={selectedProofOrder}
        onUpdateStatus={updateOrderStatus}
      />

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={cancellationModal}
        onClose={() => setCancellationModal(false)}
        order={selectedCancellationOrder}
        onUpdateStatus={updateOrderStatus}
      />

      {/* Pickup Details Modal (Pick Up flow only) */}
      <PickupDetailsModal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        order={pickupTargetOrder}
        onConfirm={async ({ pickupLocation, pickupDateTime }) => {
          const orderId = pickupTargetOrder?._id;
          if (!orderId) return;
          await updateOrderStatus(orderId, "ready_to_pickup", {
            pickupLocation,
            pickupTime: pickupDateTime,
          });
          setPickupModalOpen(false);
          setPickupTargetOrder(null);
        }}
      />
    </div>
  );
};

export default AllOrdersPage;
