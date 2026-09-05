import { PrismaClient } from "@prisma/client";
import { DEFAULT_THEME } from "../lib/theme";

const prisma = new PrismaClient();

const products = [
  {
    title: "Neon Static Oversized Tee",
    slug: "neon-static-oversized-tee",
    price: 1499,
    discountPrice: 599,
    color: "Black",
    category: "Oversized",
    section: "men",
    badges: ["LIMITED EDITION", "BEST SELLER"],
    rating: 4.6,
    reviewCount: 310,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/black-hang.jpg", "/products/black-705.jpg"],
  },
  {
    title: "Acid Bloom Graphic Tee",
    slug: "acid-bloom-graphic-tee",
    price: 1499,
    discountPrice: 599,
    color: "Royal Blue",
    category: "Oversized",
    section: "women",
    badges: ["BEST SELLER"],
    rating: 4.5,
    reviewCount: 188,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/blue-heather.jpg", "/products/rack.jpg"],
  },
  {
    title: "Chrome Halo Print Tee",
    slug: "chrome-halo-print-tee",
    price: 1299,
    discountPrice: 649,
    color: "Red",
    category: "Oversized",
    section: "women",
    badges: ["LIMITED EDITION"],
    rating: 4.4,
    reviewCount: 72,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/red-hang.jpg", "/products/rack.jpg"],
  },
  {
    title: "After Hours Drop Tee",
    slug: "after-hours-drop-tee",
    price: 1199,
    discountPrice: 599,
    color: "Beige",
    category: "Oversized",
    section: "men",
    badges: ["NEW DROP"],
    rating: 4.3,
    reviewCount: 41,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/beige-cat.jpg", "/products/grey-trails.jpg"],
  },
  {
    title: "Voltage Green Oversized Tee",
    slug: "voltage-green-oversized-tee",
    price: 1499,
    discountPrice: 599,
    color: "Green",
    category: "Oversized",
    section: "kids",
    badges: ["BEST SELLER"],
    rating: 4.7,
    reviewCount: 256,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/green-705.jpg", "/products/rack.jpg"],
  },
  {
    title: "Mono Noise Classic Tee",
    slug: "mono-noise-classic-tee",
    price: 1199,
    discountPrice: 549,
    color: "White",
    category: "Classic Fit",
    section: "kids",
    badges: ["NEW DROP"],
    rating: 4.2,
    reviewCount: 63,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/white-model.jpg", "/products/white-beard.jpg"],
  },
  {
    title: "Night Market Navy Tee",
    slug: "night-market-navy-tee",
    price: 1499,
    discountPrice: 599,
    color: "Navy",
    category: "Oversized",
    section: "men",
    badges: ["LIMITED EDITION", "BEST SELLER"],
    rating: 4.8,
    reviewCount: 421,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/navy-705.jpg", "/products/rack.jpg"],
  },
  {
    title: "Ghost Protocol Tee",
    slug: "ghost-protocol-tee",
    price: 1599,
    discountPrice: 699,
    color: "Black",
    category: "Classic Fit",
    section: "women",
    badges: ["LIMITED EDITION"],
    rating: 4.1,
    reviewCount: 19,
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    imageUrls: ["/products/black-peace.jpg", "/products/black-peace-2.jpg"],
  },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.siteSettings.deleteMany();

  await prisma.siteSettings.create({
    data: { id: "default", ...DEFAULT_THEME },
  });

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        imageUrls: JSON.stringify(p.imageUrls),
        badges: JSON.stringify(p.badges),
        isVisible: true,
      },
    });
  }

  console.log(`seeded ${products.length} products`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
