import type { PinContentItem } from "@/types";

export type PinReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  authorAlias: string | null;
  createdAt: string;
};

export type PinDetail = {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  bydel: string;
  category: string;
  terraceFacing: string | null;
  hashtags: string[];
  contentCount: number;
  reviewCount: number;
  avgRating: number | null;
  contents: PinContentItem[];
  reviews: PinReviewItem[];
};
