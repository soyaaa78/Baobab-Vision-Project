const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { buildPublicR2Url } = require("./storageUrlParser");

let cachedClient = null;

const requireEnv = (name) => {
  const value = (process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getClient = () => {
  if (cachedClient) return cachedClient;

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const endpoint =
    (process.env.R2_ENDPOINT || "").trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  cachedClient = new S3Client({
    region: (process.env.R2_REGION || "auto").trim() || "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return cachedClient;
};

const sanitizeFileName = (value) =>
  String(value || "file")
    .replace(/\\/g, "_")
    .replace(/\//g, "_")
    .replace(/\s+/g, "-");

const buildObjectKey = (folder, originalName, customName = null) => {
  const safeFolder = String(folder || "").replace(/^\/+|\/+$/g, "");
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const finalName = sanitizeFileName(customName || `${suffix}-${originalName}`);
  return `${safeFolder}/${finalName}`;
};

const uploadSingleImage = async (file, folder, options = {}) => {
  if (!file || !file.buffer) {
    throw new Error("File buffer is required");
  }

  const bucket = requireEnv("R2_BUCKET_NAME");
  const publicBaseUrl = requireEnv("R2_PUBLIC_BASE_URL");
  const key = buildObjectKey(folder, file.originalname, options.customName);
  const contentType = file.mimetype || options.contentType || "application/octet-stream";

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
    })
  );

  return buildPublicR2Url(publicBaseUrl, key);
};

const uploadMultipleImages = async (files, folder, options = {}) => {
  const uploads = (files || []).map((file) => uploadSingleImage(file, folder, options));
  return Promise.all(uploads);
};

const deleteByKey = async (key) => {
  const bucket = requireEnv("R2_BUCKET_NAME");
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteByKey,
};
