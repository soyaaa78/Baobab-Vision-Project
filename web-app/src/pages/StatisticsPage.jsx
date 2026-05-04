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
import { faPrint, faFilePdf, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import {
  buildChartSections,
  buildHighlightCards,
} from "../utils/statisticsPdfExport";
import { getPdfExportButtonLabel } from "../utils/pdfExportUi";

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

const PAGE_MARGIN = 10;
const PAGE_HEADER_HEIGHT = 24;
const PAGE_FOOTER_HEIGHT = 12;

const drawPdfFrame = ({
  pdf,
  pageWidth,
  pageHeight,
  logoBase64,
  generatedAt,
  reportDate,
  pageNumber,
}) => {
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
  pdf.text(`Generated: ${generatedAt}`, pageWidth - 8, 21, { align: "right" });
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
  pdf.text(`Page ${pageNumber}`, pageWidth - 8, pageHeight - 4.5, {
    align: "right",
  });
};

const fitBox = (sourceWidth, sourceHeight, maxWidth, maxHeight) => {
  if (!sourceWidth || !sourceHeight) {
    return { width: maxWidth, height: maxHeight };
  }

  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const scale = Math.min(widthRatio, heightRatio);

  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
};

function StatisticsPage() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [token, setToken] = useState();
  const [statisticsData, setStatisticsData] = useState(null);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState(null);
  const printRef = useRef(null);
  const pieChartRef = useRef(null);
  const salesChartRef = useRef(null);
  const viewsChartRef = useRef(null);

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

  const getChartImage = (containerRef) => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return null;
    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  };

  const handleExportPDF = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const [logoBase64, mostVisitedImage, mostBoughtImage, topRatedImage] =
        await Promise.all([
        loadImageAsBase64(baobablogo),
        mostVisitedProduct?.imageUrls?.[0]
          ? loadImageAsBase64(mostVisitedProduct.imageUrls[0]).catch(() => null)
          : Promise.resolve(null),
        mostBoughtProduct?.imageUrls?.[0]
          ? loadImageAsBase64(mostBoughtProduct.imageUrls[0]).catch(() => null)
          : Promise.resolve(null),
        topRatedProduct?.imageUrls?.[0]
          ? loadImageAsBase64(topRatedProduct.imageUrls[0]).catch(() => null)
          : Promise.resolve(null),
      ]);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const generatedAt = new Date().toLocaleString();
      const reportDate = `${dayOfWeek}, ${currentMonth} ${currentDay}, ${currentYear}`;
      const highlightCards = buildHighlightCards({
        mostVisitedProduct,
        mostBoughtProduct,
        topRatedProduct,
      }).map((card, index) => ({
        ...card,
        imageBase64: [mostVisitedImage, mostBoughtImage, topRatedImage][index] || null,
      }));
      const chartSections = buildChartSections({
        faceShapeStats,
        monthlySalesTrend,
        productViews: statisticsData?.productViews,
        selectedRangeLabel,
        currentMonth,
        currentDay,
        currentYear,
        dayOfWeek,
      }).map((section, index) => ({
        ...section,
        chartImage: [
          getChartImage(pieChartRef),
          getChartImage(salesChartRef),
          getChartImage(viewsChartRef),
        ][index],
      }));

      let pageNumber = 1;
      let cursorY = 38;
      const contentBottom = pageHeight - PAGE_FOOTER_HEIGHT - 6;
      const contentWidth = pageWidth - PAGE_MARGIN * 2;

      const startPage = () => {
        drawPdfFrame({
          pdf,
          pageWidth,
          pageHeight,
          logoBase64,
          generatedAt,
          reportDate,
          pageNumber,
        });
        cursorY = 38;
      };

      const ensureSpace = (requiredHeight) => {
        if (cursorY + requiredHeight <= contentBottom) return;
        pdf.addPage();
        pageNumber += 1;
        startPage();
      };

      const drawSummaryCards = () => {
        const gap = 6;
        const cardWidth = (contentWidth - gap * 2) / 3;
        const cardHeight = 42;
        ensureSpace(cardHeight);

        highlightCards.forEach((card, index) => {
          const x = PAGE_MARGIN + index * (cardWidth + gap);
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(226, 232, 240);
          pdf.roundedRect(x, cursorY, cardWidth, cardHeight, 3, 3, "FD");

          pdf.setFillColor(248, 178, 106);
          pdf.rect(x, cursorY, cardWidth, 1.2, "F");

          pdf.setTextColor(30, 41, 59);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.text(card.title, x + 3, cursorY + 6);

          let textX = x + 3;
          const textWidth = cardWidth - 6;
          if (card.imageBase64) {
            pdf.addImage(card.imageBase64, "PNG", x + cardWidth - 18, cursorY + 5, 13, 13);
          }

          pdf.setFontSize(9);
          pdf.text(card.name, textX, cursorY + 12);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          const metricLines = pdf.splitTextToSize(card.lines.join("\n"), textWidth - 16);
          pdf.text(metricLines, textX, cursorY + 18);
        });

        cursorY += cardHeight + 8;
      };

      const drawChartSection = (section) => {
        const titleHeight = 8;
        const chartBounds = section.chartImage
          ? fitBox(section.chartImage.width, section.chartImage.height, contentWidth - 8, 62)
          : null;
        const imageHeight = chartBounds ? chartBounds.height : 16;
        const captionLines = pdf.splitTextToSize(section.caption, contentWidth - 6);
        const sectionHeight = titleHeight + imageHeight + captionLines.length * 4 + 8;
        ensureSpace(sectionHeight);

        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(PAGE_MARGIN, cursorY, contentWidth, sectionHeight, 3, 3, "FD");

        pdf.setTextColor(139, 90, 60);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(section.title, PAGE_MARGIN + 4, cursorY + 7);

        if (section.chartImage && chartBounds) {
          const imageX = PAGE_MARGIN + 4 + ((contentWidth - 8 - chartBounds.width) / 2);
          pdf.addImage(
            section.chartImage.dataUrl,
            "PNG",
            imageX,
            cursorY + 10,
            chartBounds.width,
            chartBounds.height
          );
        } else {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          pdf.text(section.emptyMessage, PAGE_MARGIN + 4, cursorY + 20);
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          captionLines,
          PAGE_MARGIN + 4,
          cursorY + 10 + imageHeight + 2
        );

        cursorY += sectionHeight + 6;
      };

      startPage();

      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Range: ${selectedRangeLabel}`, PAGE_MARGIN, cursorY);
      cursorY += 6;

      drawSummaryCards();
      chartSections.forEach(drawChartSection);

      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`statistics-report-${dateStr}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExportingPdf(false);
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
            <button
              onClick={handleExportPDF}
              className="stat-export-btn stat-pdf-btn"
              disabled={isExportingPdf}
            >
              <FontAwesomeIcon icon={isExportingPdf ? faSpinner : faFilePdf} spin={isExportingPdf} />
              {getPdfExportButtonLabel(isExportingPdf)}
            </button>
          </div>
        </div>

        <div className="statistics-layout">
          <div className="statistics-main">
            <div className="statistics-bulk">
              <div className="piesect">
                <div className="chart-wrapper" id="stat-piechart" ref={pieChartRef}>
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
                <div className="chart-wrapper" ref={salesChartRef}>
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
                <div className="chart-wrapper" ref={viewsChartRef}>
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
