require("dotenv").config({ path: "d:/Code Repos/Baobab-Vision-Project/backend/.env" });
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function listR2Contents() {
  console.log("Checking Cloudflare R2 bucket:", process.env.R2_BUCKET_NAME);
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: "products/",
    });
    const response = await s3Client.send(command);
    if (!response.Contents || response.Contents.length === 0) {
      console.log("No files found in the 'products/' directory in R2.");
    } else {
      console.log(`Found ${response.Contents.length} files in 'products/':`);
      response.Contents.forEach((file) => {
        console.log(` - ${file.Key} (${(file.Size / 1024).toFixed(2)} KB)`);
      });
    }
  } catch (error) {
    console.error("Error connecting to R2:", error.message);
  }
}

listR2Contents();
