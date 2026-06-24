import type { PinDetail, PinReviewItem } from "@/types/pin-detail";
import type { PinContentItem } from "@/types";
import { prisma } from "@/lib/db";

function mapContent(content: {
  id: string;
  type: string;
  textContent: string | null;
  mediaUrl: string | null;
  authorAlias: string | null;
  createdAt: Date;
}): PinContentItem {
  return {
    id: content.id,
    type: content.type as PinContentItem["type"],
    textContent: content.textContent,
    mediaUrl: content.mediaUrl,
    authorAlias: content.authorAlias,
    createdAt: content.createdAt.toISOString(),
  };
}

function mapReview(review: {
  id: string;
  rating: number;
  comment: string | null;
  authorAlias: string | null;
  createdAt: Date;
}): PinReviewItem {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    authorAlias: review.authorAlias,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function getPinDetail(id: string): Promise<PinDetail | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const pin = await prisma.mapPin.findUnique({
      where: { id },
      include: {
        contents: {
          where: { moderationStatus: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          where: { moderationStatus: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pin) return null;

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
      bydel: pin.bydel,
      category: pin.category,
      terraceFacing: pin.terraceFacing,
      hashtags: pin.hashtags,
      contentCount: pin.contents.length,
      reviewCount: pin.reviews.length,
      avgRating,
      contents: pin.contents.map(mapContent),
      reviews: pin.reviews.map(mapReview),
    };
  } catch {
    return null;
  }
}

export async function addPinContent(data: {
  pinId: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
  textContent?: string;
  mediaUrl?: string;
  authorAlias?: string;
  autoApprove?: boolean;
}): Promise<{ content: PinContentItem; pending: boolean } | null> {
  const pending = !data.autoApprove;

  if (!process.env.DATABASE_URL) {
    return null;
  }

  const content = await prisma.pinContent.create({
    data: {
      pinId: data.pinId,
      type: data.type,
      textContent: data.textContent,
      mediaUrl: data.mediaUrl,
      authorAlias: data.authorAlias,
      moderationStatus: data.autoApprove ? "APPROVED" : "PENDING",
    },
  });

  return { content: mapContent(content), pending };
}

export async function addPinReview(data: {
  pinId: string;
  rating: number;
  comment?: string;
  authorAlias?: string;
  autoApprove?: boolean;
}): Promise<{ review: PinReviewItem; pending: boolean } | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const review = await prisma.placeReview.create({
    data: {
      pinId: data.pinId,
      rating: data.rating,
      comment: data.comment,
      authorAlias: data.authorAlias,
      moderationStatus: data.autoApprove ? "APPROVED" : "PENDING",
    },
  });

  return { review: mapReview(review), pending: !data.autoApprove };
}

export async function createContentReport(data: {
  targetType: "PIN_CONTENT" | "PLACE_REVIEW" | "POLITICIAN_FEEDBACK";
  targetId: string;
  reason: string;
}): Promise<boolean> {
  if (!process.env.DATABASE_URL) return true;

  await prisma.contentReport.create({ data });
  return true;
}

export async function getPendingModerationItems() {
  if (!process.env.DATABASE_URL) return { contents: [], reviews: [], feedback: [] };

  const [contents, reviews, feedback] = await Promise.all([
    prisma.pinContent.findMany({
      where: { moderationStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { pin: { select: { title: true } } },
    }),
    prisma.placeReview.findMany({
      where: { moderationStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { pin: { select: { title: true } } },
    }),
    prisma.politicianFeedback.findMany({
      where: { moderationStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { politician: { select: { name: true } } },
    }),
  ]);

  return { contents, reviews, feedback };
}

export async function moderateItem(
  type: "content" | "review" | "feedback",
  id: string,
  action: "APPROVED" | "REJECTED",
  reason?: string,
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return true;

  const status = action;
  if (type === "content") {
    await prisma.pinContent.update({
      where: { id },
      data: { moderationStatus: status, moderationReason: reason },
    });
  } else if (type === "review") {
    await prisma.placeReview.update({
      where: { id },
      data: { moderationStatus: status, moderationReason: reason },
    });
  } else {
    await prisma.politicianFeedback.update({
      where: { id },
      data: { moderationStatus: status, moderationReason: reason },
    });
  }

  return true;
}
