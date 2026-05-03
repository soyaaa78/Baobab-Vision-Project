const { parseStorageDeletionTarget } = require("./storageUrlParser");
const r2StorageService = require("./r2StorageService");

const getParserOptions = () => ({
  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
});

const uploadSingleImage = async (file, folder, options = {}) =>
  r2StorageService.uploadSingleImage(file, folder, options);

const uploadMultipleImages = async (files, folder, options = {}) =>
  r2StorageService.uploadMultipleImages(files, folder, options);

const deleteByUrl = async (imageUrl) => {
  const target = parseStorageDeletionTarget(imageUrl, getParserOptions());

  if (!target) {
    throw new Error("Unsupported image URL format");
  }

  if (target.provider === "r2") {
    await r2StorageService.deleteByKey(target.key);
    return { noop: false, provider: "r2" };
  }

  if (target.provider === "legacy_noop") {
    return { noop: true, provider: "legacy_noop" };
  }

  throw new Error(`Unsupported storage provider: ${target.provider}`);
};

const getObjectStream = (key) => r2StorageService.getObjectStream(key);

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteByUrl,
  getObjectStream,
};
