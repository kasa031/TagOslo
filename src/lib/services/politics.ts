import type { PoliticianSummary, PollSummary } from "@/types";
import { prisma } from "@/lib/db";

export async function getPoliticians(bydel?: string): Promise<PoliticianSummary[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const politicians = await prisma.politician.findMany({
      where: {
        active: true,
        ...(bydel ? { OR: [{ bydel: bydel as never }, { bydel: null }] } : {}),
      },
      include: {
        feedback: { where: { moderationStatus: "APPROVED" } },
      },
      orderBy: { name: "asc" },
    });

    return politicians.map((p) => {
      const ratings = p.feedback.map((f) => f.rating);
      return {
        id: p.id,
        name: p.name,
        party: p.party,
        role: p.role,
        bydel: p.bydel as PoliticianSummary["bydel"],
        avgRating:
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : null,
        feedbackCount: p.feedback.length,
      };
    });
  } catch {
    return [];
  }
}

function formatPoll(
  poll: {
    id: string;
    question: string;
    description: string | null;
    bydel: string;
    createdAt: Date;
    options: Array<{ id: string; label: string; votes: unknown[] }>;
    politicianTags: Array<{
      politician: { id: string; name: string; party: string | null };
    }>;
  },
): PollSummary {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  return {
    id: poll.id,
    question: poll.question,
    description: poll.description,
    bydel: poll.bydel as PollSummary["bydel"],
    createdAt: poll.createdAt.toISOString(),
    totalVotes,
    options: poll.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      votes: opt.votes.length,
      percentage:
        totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0,
    })),
    politicians: poll.politicianTags.map((tag) => ({
      id: tag.politician.id,
      name: tag.politician.name,
      party: tag.politician.party,
    })),
  };
}

export async function getPolls(bydel?: string): Promise<PollSummary[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const polls = await prisma.poll.findMany({
      where: bydel ? { bydel: bydel as never } : undefined,
      include: {
        options: { include: { votes: true } },
        politicianTags: { include: { politician: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return polls.map(formatPoll);
  } catch {
    return [];
  }
}

export async function createPoll(data: {
  question: string;
  description?: string;
  bydel: string;
  options: string[];
  politicianIds: string[];
  authorAlias?: string;
}): Promise<PollSummary> {
  if (!process.env.DATABASE_URL) {
    throw new Error("Database er ikke tilgjengelig");
  }

  const poll = await prisma.poll.create({
    data: {
      question: data.question,
      description: data.description,
      bydel: data.bydel as never,
      authorAlias: data.authorAlias,
      options: {
        create: data.options.map((label) => ({ label })),
      },
      politicianTags: data.politicianIds.length
        ? {
            create: data.politicianIds.map((politicianId) => ({ politicianId })),
          }
        : undefined,
    },
    include: {
      options: { include: { votes: true } },
      politicianTags: { include: { politician: true } },
    },
  });

  return formatPoll(poll);
}

export async function voteOnPoll(
  pollId: string,
  optionId: string,
  voterHash: string,
): Promise<PollSummary | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    await prisma.pollVote.create({
      data: { optionId, voterHash },
    });
  } catch {
    return null;
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: { include: { votes: true } },
      politicianTags: { include: { politician: true } },
    },
  });

  return poll ? formatPoll(poll) : null;
}

export async function createFeedback(data: {
  politicianId: string;
  rating: number;
  comment: string;
  bydel: string;
  authorAlias?: string;
  autoApprove?: boolean;
}): Promise<{ pending: boolean }> {
  if (!process.env.DATABASE_URL) {
    return { pending: false };
  }

  await prisma.politicianFeedback.create({
    data: {
      politicianId: data.politicianId,
      rating: data.rating,
      comment: data.comment,
      bydel: data.bydel as never,
      authorAlias: data.authorAlias,
      moderationStatus: data.autoApprove ? "APPROVED" : "PENDING",
    },
  });

  return { pending: !data.autoApprove };
}
