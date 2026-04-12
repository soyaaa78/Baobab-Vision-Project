const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

const withFallbackProduct = (product, fallbackLabel) =>
  product || {
    name: fallbackLabel,
    imageUrls: [],
  };

export function buildHighlightCards({
  mostVisitedProduct,
  mostBoughtProduct,
  topRatedProduct,
}) {
  const visited = withFallbackProduct(mostVisitedProduct, "No data available");
  const bought = withFallbackProduct(mostBoughtProduct, "No data available");
  const rated = withFallbackProduct(topRatedProduct, "No data available");

  return [
    {
      title: "Most Visited Eyewear",
      name: visited.name,
      imageUrl: visited.imageUrls?.[0] || null,
      lines: mostVisitedProduct
        ? [
            `Views: ${formatCount(visited.views)}`,
            `Category: ${visited.category || "N/A"}`,
            `Price: PHP ${formatCurrency(visited.price)}`,
          ]
        : ["No data available yet"],
    },
    {
      title: "Most Bought Product",
      name: bought.name,
      imageUrl: bought.imageUrls?.[0] || null,
      lines: mostBoughtProduct
        ? [
            `Sales: ${formatCount(bought.sales)}`,
            `Category: ${bought.category || "N/A"}`,
            `Price: PHP ${formatCurrency(bought.price)}`,
          ]
        : ["No data available yet"],
    },
    {
      title: "Top Rated This Month",
      name: rated.name,
      imageUrl: rated.imageUrls?.[0] || null,
      lines: topRatedProduct
        ? [
            `Rating: ${formatCount(rated.rating)}/5.0`,
            `Reviews: ${formatCount(rated.reviews)}`,
            `Price: PHP ${formatCurrency(rated.price)}`,
          ]
        : ["No ratings this month"],
    },
  ];
}

export function buildChartSections({
  faceShapeStats,
  monthlySalesTrend,
  productViews,
  selectedRangeLabel,
  currentMonth,
  currentDay,
  currentYear,
  dayOfWeek,
}) {
  return [
    {
      key: "face-shape",
      title: "Face Shape Recommendations",
      emptyMessage: "No face-shape recommendation data yet.",
      caption:
        faceShapeStats.length > 0
          ? `Distribution of recommendation activity as of ${currentMonth} ${currentDay}, ${currentYear}`
          : "No face-shape recommendation data yet.",
    },
    {
      key: "sales-trend",
      title: `Sales Trend (${selectedRangeLabel})`,
      emptyMessage: "No sales trend data available yet.",
      caption: monthlySalesTrend
        ? `${selectedRangeLabel} sales snapshot as of ${currentMonth} ${currentDay}, ${currentYear}`
        : "No sales trend data available yet.",
    },
    {
      key: "product-views",
      title: `Product Views (${selectedRangeLabel})`,
      emptyMessage:
        "View tracking is now live. This chart will populate as customers open product pages.",
      caption: productViews?.hasData
        ? `Product views for ${selectedRangeLabel.toLowerCase()} - ${dayOfWeek} update (${currentMonth} ${currentDay}, ${currentYear})`
        : "Product view tracking is enabled. Data will appear here once new visits are recorded.",
    },
  ];
}
