import type { BydelId, PollBydelId } from "@/lib/constants";

export type MapPinSummary = {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  bydel: BydelId;
  category: string;
  hashtags: string[];
  contentCount: number;
  reviewCount: number;
  avgRating: number | null;
};

export type PinContentItem = {
  id: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
  textContent: string | null;
  mediaUrl: string | null;
  authorAlias: string | null;
  createdAt: string;
};

export type PoliticianSummary = {
  id: string;
  name: string;
  party: string | null;
  role: string | null;
  bydel: BydelId | null;
  avgRating: number | null;
  feedbackCount: number;
};

export type PollSummary = {
  id: string;
  question: string;
  description: string | null;
  bydel: PollBydelId;
  createdAt: string;
  totalVotes: number;
  options: Array<{ id: string; label: string; votes: number; percentage: number }>;
  politicians: Array<{ id: string; name: string; party: string | null }>;
};
