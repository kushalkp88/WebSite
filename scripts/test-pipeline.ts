import assert from "node:assert/strict";
import sharp from "sharp";
import { compressImageBuffer, withRetry, fetchSourceBuffer } from "./media-migration-pipeline";

async function runTests() {
  console.log("🧪 Running Media Pipeline Self-Checks...");

  // 1. Test Retry Logic
  let attempts = 0;
  const retryResult = await withRetry(async () => {
    attempts++;
    if (attempts < 2) throw new Error("Temporary network glitch");
    return "recovered";
  }, 3, 50);
  assert.equal(retryResult, "recovered", "Retry should successfully recover from transient failures");
  assert.equal(attempts, 2, "Should have attempted exactly twice");
  console.log("  ✅ Retry backoff logic verified");

  // 2. Test Local Source Resolution
  const localBuffer = await fetchSourceBuffer("/products/rack.jpg");
  assert(localBuffer !== null, "Should resolve local /products/rack.jpg");
  assert(localBuffer.byteLength > 1000, "Local buffer should contain image data");
  console.log("  ✅ Local source resolver verified");

  // 3. Test Sharp Perceptual Compression & Resizing
  // Generate an uncompressed 2400 x 3200 test image (exceeding 2048px bounding box)
  const rawTestBuffer = await sharp({
    create: {
      width: 2400,
      height: 3200,
      channels: 4,
      background: { r: 18, g: 18, b: 24, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const initialSize = rawTestBuffer.byteLength;
  const compressedBuffer = await compressImageBuffer(rawTestBuffer);
  const compressedMetadata = await sharp(compressedBuffer).metadata();

  assert.equal(compressedMetadata.format, "webp", "Output format must be webp");
  assert(
    (compressedMetadata.width ?? 0) <= 2048,
    `Width must be <= 2048 (got ${compressedMetadata.width})`
  );
  assert(
    (compressedMetadata.height ?? 0) <= 2048,
    `Height must be <= 2048 (got ${compressedMetadata.height})`
  );
  assert(
    compressedBuffer.byteLength < initialSize,
    `Compressed size (${compressedBuffer.byteLength}) must be smaller than raw size (${initialSize})`
  );

  console.log(
    `  ✅ Compression verified: ${initialSize} bytes ➔ ${compressedBuffer.byteLength} bytes (${compressedMetadata.width}x${compressedMetadata.height} WebP)`
  );

  console.log("🎉 All Media Pipeline self-checks passed!\n");
}

runTests().catch((err) => {
  console.error("❌ Pipeline tests failed:", err);
  process.exit(1);
});
