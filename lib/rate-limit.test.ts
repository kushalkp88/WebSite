import assert from "node:assert/strict";
import { checkRateLimit } from "./rate-limit";

// 1. Initial requests within limit succeed
const key = "test-client-ip";
const r1 = checkRateLimit(key, 2, 500);
assert.equal(r1.success, true);
assert.equal(r1.remaining, 1);

const r2 = checkRateLimit(key, 2, 500);
assert.equal(r2.success, true);
assert.equal(r2.remaining, 0);

// 2. Request exceeding limit fails
const r3 = checkRateLimit(key, 2, 500);
assert.equal(r3.success, false);
assert.equal(r3.remaining, 0);

console.log("rate-limit check ok");
