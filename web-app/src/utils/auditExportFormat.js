const EXCLUDED_CHANGE_FIELDS = new Set(["createdAt", "updatedAt", "__v"]);

const toExportString = (value) => {
  if (value === null || value === undefined) {
    return "None";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const isDeepEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;

  if (typeof a === "object" && a !== null && b !== null) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) {
        if (!isDeepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!isDeepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return String(a) === String(b);
};

export function buildAuditTargetExportText(log) {
  if (!log?.targetModel && !log?.targetId) {
    return "N/A";
  }

  if (log.targetModel && log.targetId) {
    return `${log.targetModel} (${log.targetId})`;
  }

  return String(log.targetModel || log.targetId);
}

export function buildAuditMetadataExportText(log) {
  const entries = Object.entries(log?.metadata || {});
  if (entries.length === 0) {
    return "None";
  }

  return entries
    .map(([key, value]) => `${key}: ${toExportString(value)}`)
    .join("; ");
}

export function buildAuditChangeExportText(log) {
  const oldValues = log?.oldValues || {};
  const newValues = log?.newValues || {};
  const keys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  const changes = [];

  for (const key of keys) {
    if (EXCLUDED_CHANGE_FIELDS.has(key)) continue;

    const oldValue = oldValues[key];
    const newValue = newValues[key];

    if (oldValue === undefined && newValue === undefined) continue;
    if (isDeepEqual(oldValue, newValue)) continue;

    changes.push(`${key}: ${toExportString(oldValue)} -> ${toExportString(newValue)}`);
  }

  if (changes.length === 0) {
    return "None";
  }

  return changes.join("; ");
}
