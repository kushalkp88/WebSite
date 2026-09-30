import assert from "node:assert/strict";
import {
  useShop,
  shopActions,
  selectCartCount,
  selectWishCount,
  selectIsWished,
} from "./cart-store";

// Reset state before tests
useShop.setState({ cart: [], wishlist: [], bagOpen: false, wishlistOpen: false, search: "" });

// 1. Verify actions exist and are functions
assert.equal(typeof shopActions.addToCart, "function");
assert.equal(typeof shopActions.toggleWishlist, "function");
assert.equal(typeof shopActions.openBag, "function");
assert.equal(typeof shopActions.closeBag, "function");
assert.equal(typeof shopActions.setQty, "function");
assert.equal(typeof shopActions.clearCart, "function");

// 2. Test addToCart and selectCartCount
assert.equal(selectCartCount(useShop.getState()), 0);

shopActions.addToCart({
  productId: "p1",
  slug: "test-shirt",
  title: "Test Shirt",
  image: "https://ik.imagekit.io/test.jpg",
  price: 999,
  size: "M",
  qty: 2,
  maxStock: 5,
});

assert.equal(selectCartCount(useShop.getState()), 2);
assert.equal(useShop.getState().cart.length, 1);
assert.equal(useShop.getState().bagOpen, true);

// Add same item (increments qty)
shopActions.addToCart({
  productId: "p1",
  slug: "test-shirt",
  title: "Test Shirt",
  image: "https://ik.imagekit.io/test.jpg",
  price: 999,
  size: "M",
  qty: 1,
  maxStock: 5,
});
assert.equal(selectCartCount(useShop.getState()), 3);

// 3. Test Wishlist toggle and selectIsWished
assert.equal(selectWishCount(useShop.getState()), 0);
assert.equal(selectIsWished("p1")(useShop.getState()), false);

shopActions.toggleWishlist({
  productId: "p1",
  slug: "test-shirt",
  title: "Test Shirt",
  image: "https://ik.imagekit.io/test.jpg",
  price: 999,
});

assert.equal(selectWishCount(useShop.getState()), 1);
assert.equal(selectIsWished("p1")(useShop.getState()), true);
assert.equal(selectIsWished("p2")(useShop.getState()), false);

// Toggle again to remove
shopActions.toggleWishlist({
  productId: "p1",
  slug: "test-shirt",
  title: "Test Shirt",
  image: "https://ik.imagekit.io/test.jpg",
  price: 999,
});

assert.equal(selectWishCount(useShop.getState()), 0);
assert.equal(selectIsWished("p1")(useShop.getState()), false);

// 4. Test setQty and clearCart
shopActions.setQty("p1", "M", 4);
assert.equal(selectCartCount(useShop.getState()), 4);

shopActions.clearCart();
assert.equal(selectCartCount(useShop.getState()), 0);
assert.equal(useShop.getState().cart.length, 0);

console.log("cart-store check ok");
