const { initializeApp, getApps } = require("firebase/app");
const { getStorage, ref, deleteObject } = require("firebase/storage");

let cachedStorage = null;

const getStorageClient = () => {
  if (cachedStorage) return cachedStorage;

  const storageBucket = (process.env.FIREBASE_STORAGEBUCKET || "").trim();
  if (!storageBucket) {
    throw new Error("FIREBASE_STORAGEBUCKET is required to delete legacy Firebase assets");
  }

  if (!getApps().length) {
    initializeApp({ storageBucket });
  }

  cachedStorage = getStorage();
  return cachedStorage;
};

const deleteByPath = async (path) => {
  const storage = getStorageClient();
  await deleteObject(ref(storage, path));
};

module.exports = {
  deleteByPath,
};
