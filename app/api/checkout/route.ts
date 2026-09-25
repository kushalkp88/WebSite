import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SIZES, type Size } from "@/lib/product";

export const dynamic = "force-dynamic";

interface CheckoutItemInput {
  productId: string;
  size: string;
  qty: number;
}

interface CheckoutRequestBody {
  items?: CheckoutItemInput[];
  couponCode?: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
}

const VALID_COUPONS = new Set(["INK10", "UNHINGED10", "DROP10"]);
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export async function POST(req: Request) {
  try {
    let body: CheckoutRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
    }

    const rawItems = body.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty. Please add items to checkout." }, { status: 400 });
    }

    // 1. Validate item shapes and size values
    const validatedItems: { productId: string; size: Size; qty: number }[] = [];
    for (const item of rawItems) {
      if (!item.productId || typeof item.productId !== "string") {
        return NextResponse.json({ error: "Invalid product ID in cart item." }, { status: 400 });
      }
      if (!SIZES.includes(item.size as Size)) {
        return NextResponse.json({ error: `Invalid size '${item.size}'. Allowed sizes: ${SIZES.join(", ")}.` }, { status: 400 });
      }
      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 10) {
        return NextResponse.json({ error: "Quantity must be an integer between 1 and 10 per item." }, { status: 400 });
      }
      validatedItems.push({
        productId: item.productId,
        size: item.size as Size,
        qty,
      });
    }

    // 2. Fetch products directly from PostgreSQL via Prisma to prevent price tampering
    const productIds = Array.from(new Set(validatedItems.map((i) => i.productId)));
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isVisible: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Verify all requested products exist and are active
    for (const item of validatedItems) {
      const p = productMap.get(item.productId);
      if (!p) {
        return NextResponse.json(
          { error: "One or more items in your cart are no longer available. Please refresh your bag." },
          { status: 400 }
        );
      }
    }

    // 3. Server-side recalculation of subtotal, coupon discount, shipping, and total amount
    let calculatedSubtotal = 0;
    for (const item of validatedItems) {
      const p = productMap.get(item.productId)!;
      // Price is ALWAYS read from database, never trusted from client payload
      const unitPrice = p.discountPrice ?? p.price;
      calculatedSubtotal += unitPrice * item.qty;
    }

    const cleanCoupon = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
    const isCouponValid = VALID_COUPONS.has(cleanCoupon);
    const calculatedDiscount = isCouponValid ? Math.round(calculatedSubtotal * 0.1) : 0;
    const calculatedShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const finalTotalAmount = Math.max(0, calculatedSubtotal - calculatedDiscount) + calculatedShipping;

    // 4. Atomic Transaction: Concurrency-safe row-level stock deduction & Order creation
    const orderNumber = `UNH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      // Deduct inventory atomically with row-level safety
      for (const item of validatedItems) {
        const p = productMap.get(item.productId)!;
        const sizeField = `stock${item.size}` as "stockS" | "stockM" | "stockL" | "stockXL";

        // updateMany with { [sizeField]: { gte: item.qty } } ensures an exclusive row-level lock
        // and guarantees stock cannot drop below zero under high concurrent traffic
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            [sizeField]: { gte: item.qty },
          },
          data: {
            [sizeField]: { decrement: item.qty },
          },
        });

        if (updated.count === 0) {
          throw new Error(
            `Insufficient stock for "${p.title}" (Size ${item.size}). Inventory was just claimed by another customer.`
          );
        }
      }

      // Record confirmed order
      return tx.order.create({
        data: {
          orderNumber,
          subtotal: calculatedSubtotal,
          discountAmount: calculatedDiscount,
          shippingFee: calculatedShipping,
          totalAmount: finalTotalAmount,
          couponCode: isCouponValid ? cleanCoupon : null,
          status: "CONFIRMED",
          customerName: body.customerName ? String(body.customerName).slice(0, 100) : "Guest Customer",
          customerEmail: body.customerEmail ? String(body.customerEmail).slice(0, 100) : null,
          shippingAddress: body.shippingAddress ? String(body.shippingAddress).slice(0, 255) : null,
          items: {
            create: validatedItems.map((item) => {
              const p = productMap.get(item.productId)!;
              return {
                productId: p.id,
                title: p.title,
                slug: p.slug,
                size: item.size,
                price: p.discountPrice ?? p.price,
                qty: item.qty,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });
    });

    // 5. Invalidate ISR page caches so stock counters and badges update immediately
    try {
      revalidatePath("/");
      revalidatePath("/catalog");
    } catch {
      // Invariant: static generation store might be absent during non-request execution contexts
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      itemCount: validatedItems.reduce((a, b) => a + b.qty, 0),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout transaction failed.";
    // If it's an inventory race condition failure, return 409 Conflict
    const isInventoryError = message.includes("Insufficient stock");
    return NextResponse.json(
      { error: message },
      { status: isInventoryError ? 409 : 500 }
    );
  }
}
