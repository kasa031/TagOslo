import type { MapPinSummary } from "@/types";
import { DEMO_PINS } from "@/lib/demo-data";
import { prisma } from "@/lib/db";

function toPinSummary(
  pin: {
    id: string;
    title: string;
    description: string | null;
    latitude: number;
    longitude: number;
    address: string | null;
    bydel: string;
    category: string;
    hashtags: string[];
    contents: unknown[];
    reviews: Array<{ rating: number }>;
  },
): MapPinSummary {
  const ratings = pin.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

  return {
    id: pin.id,
    title: pin.title,
    description: pin.description,
    latitude: pin.latitude,
    longitude: pin.longitude,
    address: pin.address,
    bydel: pin.bydel as MapPinSummary["bydel"],
    category: pin.category,
    hashtags: pin.hashtags,
    contentCount: pin.contents.length,
    reviewCount: pin.reviews.length,
    avgRating,
  };
}

export async function getMapPins(bydel?: string): Promise<MapPinSummary[]> {
  if (!process.env.DATABASE_URL) {
    return bydel ? DEMO_PINS.filter((p) => p.bydel === bydel) : DEMO_PINS;
  }

  try {
    const pins = await prisma.mapPin.findMany({
      where: bydel ? { bydel: bydel as never } : undefined,
      include: {
        contents: { where: { moderationStatus: "APPROVED" } },
        reviews: { where: { moderationStatus: "APPROVED" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return pins.map(toPinSummary);
  } catch {
    return DEMO_PINS;
  }
}

export async function createMapPin(data: {
  title: string;
  description?: string;
  address?: string;
  bydel: string;
  category: string;
  terraceFacing?: string;
  hashtags: string[];
  latitude: number;
  longitude: number;
  authorAlias?: string;
  story?: string;
}): Promise<MapPinSummary> {
  if (!process.env.DATABASE_URL) {
    const demoPin: MapPinSummary = {
      id: `demo-${Date.now()}`,
      title: data.title,
      description: data.description ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address ?? null,
      bydel: data.bydel as MapPinSummary["bydel"],
      category: data.category,
      hashtags: data.hashtags,
      contentCount: data.story ? 1 : 0,
      reviewCount: 0,
      avgRating: null,
    };
    return demoPin;
  }

  const pin = await prisma.mapPin.create({
    data: {
      title: data.title,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      bydel: data.bydel as never,
      category: data.category as never,
      terraceFacing: data.terraceFacing || null,
      hashtags: data.hashtags,
      authorAlias: data.authorAlias,
      contents: data.story
        ? {
            create: {
              type: "TEXT",
              textContent: data.story,
              authorAlias: data.authorAlias,
              moderationStatus: "PENDING",
            },
          }
        : undefined,
    },
    include: {
      contents: true,
      reviews: true,
    },
  });

  return toPinSummary(pin);
}
