const buildUrlTargetMap = (urls, targets) => {
  const explicitTargets =
    Array.isArray(targets) &&
    targets.length === urls.length &&
    targets.every((n) => Number.isInteger(n) && n >= 0);

  return urls.reduce((byOptionIdx, url, fileIdx) => {
    const optIdx = explicitTargets ? targets[fileIdx] : fileIdx;
    if (
      typeof optIdx === "number" &&
      optIdx >= 0 &&
      byOptionIdx[optIdx] == null
    ) {
      byOptionIdx[optIdx] = url;
    }
    return byOptionIdx;
  }, {});
};

const applyTargetedUrls = (colorOptions, urls, targets, fieldName) => {
  const byOptionIdx = buildUrlTargetMap(urls, targets);
  return colorOptions.map((opt, idx) => ({
    ...(opt.toObject?.() || opt),
    [fieldName]: byOptionIdx[idx] || opt[fieldName],
  }));
};

const mergeOrderedUrls = (existingUrls, uploadedUrls, targets) => {
  const merged = Array.isArray(existingUrls) ? [...existingUrls] : [];
  const byIndex = buildUrlTargetMap(uploadedUrls, targets);

  Object.entries(byIndex).forEach(([idx, url]) => {
    merged[Number(idx)] = url;
  });

  return merged.filter((url) => typeof url === "string" && url.trim());
};

module.exports = {
  applyTargetedUrls,
  buildUrlTargetMap,
  mergeOrderedUrls,
};
