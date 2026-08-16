import assert from "node:assert/strict";
import { isOutOfStock, percentOff, stockFor, totalStock } from "./product";

const oos = { stockS: 0, stockM: 0, stockL: 0, stockXL: 0 };
assert.equal(isOutOfStock(oos), true);
assert.equal(totalStock(oos), 0);

const mixed = { stockS: 0, stockM: 4, stockL: 2, stockXL: 0 };
assert.equal(isOutOfStock(mixed), false);
assert.equal(stockFor(mixed, "M"), 4);
assert.equal(stockFor(mixed, "S"), 0);

assert.equal(percentOff({ price: 1499, discountPrice: 599 }), 60);
assert.equal(percentOff({ price: 1000, discountPrice: null }), 0);

console.log("product-check ok");
