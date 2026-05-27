import test from "node:test";
import assert from "node:assert/strict";
import {
  buildHighlightCards,
  buildChartSections,
} from "./statisticsPdfExport.js";

test("buildHighlightCards returns formatted metric lines and placeholders", () => {
  const cards = buildHighlightCards({
    mostVisitedProduct: {
      name: "Aster",
      views: 42,
      category: "Eyewear",
      price: 1234.5,
      imageUrls: ["https://example.com/a.png"],
    },
    mostBoughtProduct: null,
    topRatedProduct: {
      name: "Banyan",
      rating: 4.7,
      reviews: 12,
      price: 2500,
    },
  });

  assert.deepEqual(cards[0].lines, [
    "Views: 42",
    "Category: Eyewear",
    "Price: PHP 1,234.50",
  ]);
  assert.equal(cards[1].name, "No data available");
  assert.equal(cards[1].lines[0], "No data available yet");
  assert.deepEqual(cards[2].lines, [
    "Rating: 4.7/5.0",
    "Reviews: 12",
    "Price: PHP 2,500.00",
  ]);
});

test("buildChartSections marks empty sections with fallback copy", () => {
  const sections = buildChartSections({
    faceShapeStats: [],
    monthlySalesTrend: null,
    productViews: { hasData: false, series: { labels: [], datasets: [] } },
    selectedRangeLabel: "Past 30 Days",
    currentMonth: "Apr",
    currentDay: 13,
    currentYear: 2026,
    dayOfWeek: "Monday",
  });

  assert.equal(sections[0].emptyMessage, "No face-shape recommendation data yet.");
  assert.equal(sections[1].emptyMessage, "No sales trend data available yet.");
  assert.equal(
    sections[2].caption,
    "Product view tracking is enabled. Data will appear here once new visits are recorded."
  );
});
