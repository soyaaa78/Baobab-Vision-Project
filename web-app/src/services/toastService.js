// Simple toast pub-sub service
let listeners = new Set();
let counter = 0;

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showToast({ message, type = "info", duration = 2500 }) {
  const id = ++counter;
  const payload = { id, message, type, duration };
  listeners.forEach((fn) => fn(payload));
  return id;
}

export function clearToasts() {
  listeners.forEach((fn) => fn({ clear: true }));
}
