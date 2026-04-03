import React, { useEffect, useRef, useState } from "react";
import "../styles/StatisticsPage.css";
import { PieChart } from "../components/charts/Pie.jsx";
import { SalesLineChart } from "../components/charts/SalesLineChart.jsx";
import { ProductViewsChart } from "../components/charts/ProductViewsChart.jsx";
import placeholder from "../assets/placeholder.png";
import baobablogo from "../assets/bvfull.png";
import axios from "axios";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import {
  addPaginatedCanvasToPdf,
  captureElementCanvas,
} from "../utils/pdfReportExport";

const cardSkeleton = (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <div className="skeleton" style={{ width: "120px", height: "14px" }} />
    <div className="skeleton" style={{ width: "160px", height: "18px" }} />
    <div className="skeleton" style={{ width: "100px", height: "14px" }} />
    <div className="skeleton" style={{ width: "60px", height: "14px" }} />
  </div>
);

const chartStateBox = (message, minHeight = 220) => (
  <div
    style={{
      minHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      color: "#64748b",
      fontStyle: "italic",
      padding: "1rem",
    }}
  >
    {message}
  </div>
);

const toFiniteNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatCount = (value) => {
  const num = toFiniteNumber(value);
  return (num ?? 0).toLocaleString();
};

const formatCurrency = (value) => {
  const num = toFiniteNumber(value);
  return (num ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatSafeYear = (value, fallbackYear) => {
  const year = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return fallbackYear;
  return year;
};

const RANGE_OPTIONS = [
  { value: "7d", label: "Past 7 Days" },
  { value: "30d", label: "Past 30 Days" },
  { value: "90d", label: "Past 90 Days" },
  { value: "ytd", label: "Year to Date" },
];

function StatisticsPage() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [token, setToken] = useState();
  const [statisticsData, setStatisticsData] = useState(null);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchStatisticsDashboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${SERVER_URL}/api/products/statistics-dashboard`,
          {
            params: { range: selectedRange },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatisticsData(response.data.data);
        setError(null);
      } catch {
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatisticsDashboard();
  }, [SERVER_URL, token, selectedRange]);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleDateString("en-US", {
    month: "short",
  });
  const currentDay = currentDate.getDate();
  const dayOfWeek = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const faceShapeStats = statisticsData?.faceShape?.stats || [];
  const monthlySalesTrend = statisticsData?.monthlySalesTrend || null;
  const safeMonthlyYear = formatSafeYear(monthlySalesTrend?.year, currentYear);
  const weeklyProductViews = statisticsData?.productViews?.week || null;
  const productViewSeries = statisticsData?.productViews?.series || weeklyProductViews;
  const selectedRangeLabel =
    statisticsData?.selectedRangeLabel ||
    RANGE_OPTIONS.find((option) => option.value === selectedRange)?.label ||
    "Past 30 Days";
  const mostVisitedProduct = statisticsData?.productViews?.mostVisitedProduct || null;
  const mostBoughtProduct = statisticsData?.mostBoughtProduct || null;
  const topRatedProduct = statisticsData?.topRatedProduct || null;

  const handlePrint = () => window.print();

  const loadImageAsBase64 = (url) =>
    fetch(url)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          })
      );

  const waitForImageLoad = (imgEl) =>
    new Promise((resolve) => {
      if (!imgEl) {
        resolve();
        return;
      }
      if (imgEl.complete && imgEl.naturalWidth > 0) {
        resolve();
        return;
      }
      const onDone = () => {
        imgEl.removeEventListener("load", onDone);
        imgEl.removeEventListener("error", onDone);
        resolve();
      };
      imgEl.addEventListener("load", onDone, { once: true });
      imgEl.addEventListener("error", onDone, { once: true });
    });

  const waitForNextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const handleExportPDF = async () => {
    const element = contentRef.current;
    if (!element) return;

    let externalImgs = [];
    let originalSrcs = [];
    try {
      element.classList.add("pdf-exporting");

      externalImgs = Array.from(element.querySelectorAll("img")).filter(
        (img) =>
          img.src.startsWith("http") &&
          !img.src.startsWith(window.location.origin)
      );

      const [logoBase64, ...imgBase64s] = await Promise.all([
        loadImageAsBase64(baobablogo),
        ...externalImgs.map((img) => loadImageAsBase64(img.src).catch(() => null)),
      ]);

      originalSrcs = externalImgs.map((img) => img.src);
      externalImgs.forEach((img, i) => {
        if (imgBase64s[i]) img.src = imgBase64s[i];
      });

      await Promise.all(
        externalImgs.map((img, i) =>
          imgBase64s[i] ? waitForImageLoad(img) : Promise.resolve()
        )
      );
      await waitForNextFrame();

      const canvas = await captureElementCanvas(element, { scale: 2 });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentY = 34;
      const footerY = pageHeight - 12;
      const availableContentHeight = footerY - contentY;
      const generatedAt = new Date().toLocaleString();
      const reportDate = `${dayOfWeek}, ${currentMonth} ${currentDay}, ${currentYear}`;

      addPaginatedCanvasToPdf({
        pdf,
        canvas,
        contentY,
        contentWidth: pageWidth,
        contentHeightPerPage: availableContentHeight,
        drawPageDecorators: ({ pageNumber, totalPages }) => {
          pdf.setFillColor(252, 247, 242);
          pdf.rect(0, 0, pageWidth, 30, "F");

          pdf.addImage(logoBase64, "PNG", 8, 6, 55, 18);

          pdf.setTextColor(139, 90, 60);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.text("STATISTICS REPORT", pageWidth - 8, 14, { align: "right" });

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Generated: ${generatedAt}`, pageWidth - 8, 21, {
            align: "right",
          });
          pdf.text(reportDate, pageWidth - 8, 27, { align: "right" });

          pdf.setFillColor(139, 90, 60);
          pdf.rect(0, 30, pageWidth, 1.5, "F");
          pdf.setFillColor(234, 182, 118);
          pdf.rect(0, 31.5, pageWidth, 0.8, "F");

          pdf.setFillColor(252, 247, 242);
          pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
          pdf.setFillColor(139, 90, 60);
          pdf.rect(0, pageHeight - 12, pageWidth, 0.8, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          pdf.setTextColor(139, 90, 60);
          pdf.text(
            "Baobab Vision Eyewear - CONFIDENTIAL - FOR INTERNAL USE ONLY",
            8,
            pageHeight - 4.5
          );

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 8, pageHeight - 4.5, {
            align: "right",
          });
        },
      });

      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`statistics-report-${dateStr}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      externalImgs.forEach((img, i) => {
        if (originalSrcs[i]) img.src = originalSrcs[i];
      });
      element.classList.remove("pdf-exporting");
    }
  };

  return (
    <div className="page" id="statistics">
      <div ref={printRef}>
        <div className="statistics-page-header">
          <div className="print-header-stats">
            <div className="print-header-top-stats">
              <img src={baobablogo} alt="Baobab Vision" className="print-logo-stats" />
              <div className="print-header-info-stats">
                <h2>Statistics Report</h2>
                <p className="print-generated-stats">Generated: {new Date().toLocaleString()}</p>
                <p className="print-generated-stats">
                  {dayOfWeek}, {currentMonth} {currentDay}, {currentYear}
                </p>
              </div>
            </div>
            <div className="print-meta-bar-stats">
              <span>Baobab Vision Eyewear Dashboard</span>
              <span>CONFIDENTIAL - FOR INTERNAL USE ONLY</span>
            </div>
          </div>
          <div className="statistics-header-actions">
            <div className="statistics-range-control">
              <label htmlFor="stats-range-select">Range</label>
              <select
                id="stats-range-select"
                value={selectedRange}
                onChange={(event) => setSelectedRange(event.target.value)}
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handlePrint} className="stat-export-btn stat-print-btn">
              <FontAwesomeIcon icon={faPrint} /> Print
            </button>
            <button onClick={handleExportPDF} className="stat-export-btn stat-pdf-btn">
              <FontAwesomeIcon icon={faFilePdf} /> Export PDF
            </button>
          </div>
        </div>

        <div className="statistics-layout" ref={contentRef}>
          <div className="statistics-main">
            <div className="statistics-bulk">
              <div className="piesect">
                <div className="chart-wrapper" id="stat-piechart">
                  {loading
                    ? chartStateBox("Loading chart...", 320)
                    : error
                      ? chartStateBox("Failed to load chart data.", 320)
                      : faceShapeStats.length > 0
                        ? <PieChart stats={faceShapeStats} />
                        : chartStateBox("No face-shape recommendation data yet.", 320)}
                </div>
              </div>
              <div className="linesect">
                <div className="chart-wrapper">
                  {loading ? (
                    chartStateBox("Loading chart...")
                  ) : error ? (
                    chartStateBox("Failed to load chart data.")
                  ) : monthlySalesTrend ? (
                    <SalesLineChart
                      labels={monthlySalesTrend.labels}
                      values={monthlySalesTrend.values}
                      year={safeMonthlyYear}
                      title={`Sales Trend (${selectedRangeLabel})`}
                      datasetLabel={`${selectedRangeLabel} Sales`}
                    />
                  ) : (
                    chartStateBox("No sales trend data available yet.")
                  )}
                  <p>
                    {monthlySalesTrend
                      ? `${selectedRangeLabel} sales snapshot as of ${currentMonth} ${currentDay}, ${currentYear}`
                      : `${currentYear} sales year-to-date through ${currentMonth} ${currentDay}`}
                  </p>
                </div>
                <div className="chart-wrapper">
                  {loading ? (
                    chartStateBox("Loading chart...")
                  ) : error ? (
                    chartStateBox("Failed to load chart data.")
                  ) : (
                    <ProductViewsChart
                      labels={productViewSeries?.labels || []}
                      datasets={productViewSeries?.datasets || []}
                      title={`Product Views (${selectedRangeLabel})`}
                      emptyMessage="View tracking is now live. This chart will populate as customers open product pages."
                    />
                  )}
                  <p>
                    {statisticsData?.productViews?.hasData
                      ? `Product views for ${selectedRangeLabel.toLowerCase()} - ${dayOfWeek} update (${currentMonth} ${currentDay}, ${currentYear})`
                      : "Product view tracking is enabled. Data will appear here once new visits are recorded."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="statistics-sidebar">
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="content-text">
                  <p className="card-header">Most Visited Eyewear</p>
                  {loading ? (
                    cardSkeleton
                  ) : error ? (
                    <p>Failed to load</p>
                  ) : mostVisitedProduct ? (
                    <>
                      <p>{mostVisitedProduct.name}</p>
                      <p>Views: {formatCount(mostVisitedProduct.views)}</p>
                      <p>Category: {mostVisitedProduct.category}</p>
                      <p>Price: {"\u20B1"}{formatCurrency(mostVisitedProduct.price)}</p>
                    </>
                  ) : (
                    <p>No view data yet</p>
                  )}
                </div>
                <div className="content-pic">
                  <img
                    src={mostVisitedProduct?.imageUrls?.[0] || placeholder}
                    alt={mostVisitedProduct?.name || "Product"}
                  />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <div className="content-text">
                  <p className="card-header">Most Bought Product</p>
                  {loading ? (
                    cardSkeleton
                  ) : error ? (
                    <p>Failed to load</p>
                  ) : mostBoughtProduct ? (
                    <>
                      <p>{mostBoughtProduct.name}</p>
                      <p>Sales: {formatCount(mostBoughtProduct.sales)}</p>
                      <p>Category: {mostBoughtProduct.category}</p>
                      <p>Price: {"\u20B1"}{formatCurrency(mostBoughtProduct.price)}</p>
                    </>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
                <div className="content-pic">
                  <img
                    src={mostBoughtProduct?.imageUrls?.[0] || placeholder}
                    alt={mostBoughtProduct?.name || "Product"}
                  />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <div className="content-text">
                  <p className="card-header">Top Rated This Month</p>
                  {loading ? (
                    cardSkeleton
                  ) : topRatedProduct ? (
                    <>
                      <p>{topRatedProduct.name}</p>
                      <p>Rating: {formatCount(topRatedProduct.rating)}/5.0</p>
                      <p>Reviews: {formatCount(topRatedProduct.reviews)}</p>
                      <p>Price: {"\u20B1"}{formatCurrency(topRatedProduct.price)}</p>
                    </>
                  ) : (
                    <p>No ratings this month</p>
                  )}
                </div>
                <div className="content-pic">
                  <img
                    src={topRatedProduct?.imageUrls?.[0] || placeholder}
                    alt={topRatedProduct?.name || "Product"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;
