import assert from "node:assert/strict";
import { buildImageKitUrl } from "./image-kit-utils";
import { isImageKitConfigured } from "./imagekit";

// 1. Fallback handling for empty or null URLs
assert.equal(buildImageKitUrl(null), "/products/rack.jpg");
assert.equal(buildImageKitUrl(""), "/products/rack.jpg");

// 2. Non-ImageKit URLs should pass through unchanged (backward compatibility)
assert.equal(buildImageKitUrl("/products/black-hang.jpg", "card"), "/products/black-hang.jpg");
assert.equal(buildImageKitUrl("https://images.unsplash.com/photo-123", "thumb"), "https://images.unsplash.com/photo-123");

// 3. ImageKit transformation parameters
const sample = "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg";

assert.equal(
  buildImageKitUrl(sample, "thumb"),
  "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg?tr=w-150,h-200,fo-auto,q-75,f-auto"
);

assert.equal(
  buildImageKitUrl(sample, "card"),
  "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg?tr=w-400,h-533,fo-auto,q-80,f-auto"
);

assert.equal(
  buildImageKitUrl(sample, "detail"),
  "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg?tr=w-1200,h-1600,fo-auto,q-85,f-auto"
);

assert.equal(
  buildImageKitUrl(sample, "raw"),
  "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg"
);

// 4. Strips prior transformation queries before applying new ones
const alreadyTransformed = "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg?tr=w-100,h-100";
assert.equal(
  buildImageKitUrl(alreadyTransformed, "card"),
  "https://ik.imagekit.io/inkdrop/products/tshirt-navy.jpg?tr=w-400,h-533,fo-auto,q-80,f-auto"
);

// 5. Configuration check
assert.equal(typeof isImageKitConfigured(), "boolean");

console.log("image-kit check ok");
