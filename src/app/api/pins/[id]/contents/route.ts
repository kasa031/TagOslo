import { NextResponse } from "next/server";
import { z } from "zod";
import { addPinContent } from "@/lib/services/pin-detail";
import { moderateTexts, moderateMediaCaption } from "@/lib/moderation";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { uploadMedia } from "@/lib/supabase/storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES_PER_SUBMISSION = 5;

const jsonSchema = z.object({
  type: z.literal("TEXT"),
  textContent: z.string().min(3).max(3000),
  authorAlias: z.string().max(40).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: pinId } = await params;
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`content:${clientKey}`, 20, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "For mange forespørsler. Prøv igjen senere." },
      { status: 429 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const type = form.get("type") as string;
      const textContent = (form.get("textContent") as string) || undefined;
      const authorAlias = (form.get("authorAlias") as string) || undefined;
      const turnstileToken = (form.get("turnstileToken") as string) || undefined;
      const singleFile = form.get("file") as File | null;
      const filesFromForm = form
        .getAll("file")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);
      const files =
        type === "IMAGE"
          ? filesFromForm.length > 0
            ? filesFromForm
            : singleFile
              ? [singleFile]
              : []
          : singleFile
            ? [singleFile]
            : [];

      if (!(await verifyTurnstile(turnstileToken))) {
        return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
      }

      if (!["IMAGE", "VIDEO", "AUDIO"].includes(type)) {
        return NextResponse.json({ error: "Ugyldig mediatype." }, { status: 400 });
      }

      if (files.length === 0) {
        return NextResponse.json({ error: "Fil mangler." }, { status: 400 });
      }

      if (type === "IMAGE" && files.length > MAX_IMAGES_PER_SUBMISSION) {
        return NextResponse.json(
          { error: `Du kan laste opp maks ${MAX_IMAGES_PER_SUBMISSION} bilder om gangen.` },
          { status: 400 },
        );
      }

      if (type !== "IMAGE" && files.length > 1) {
        return NextResponse.json(
          { error: "Kun ett video- eller lydband om gangen." },
          { status: 400 },
        );
      }

      const limits: Record<string, number> = {
        IMAGE: MAX_IMAGE_BYTES,
        VIDEO: MAX_VIDEO_BYTES,
        AUDIO: MAX_AUDIO_BYTES,
      };

      for (const file of files) {
        if (file.size > limits[type]) {
          return NextResponse.json({ error: `"${file.name}" er for stor.` }, { status: 400 });
        }
      }

      const moderation = await moderateMediaCaption([textContent ?? "", authorAlias ?? ""]);
      if (!moderation.approved) {
        return NextResponse.json({ error: moderation.reason }, { status: 422 });
      }

      const created: Awaited<ReturnType<typeof addPinContent>>[] = [];

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadMedia(buffer, file.name, file.type);

        if (!uploaded) {
          return NextResponse.json(
            { error: "Opplasting ikke tilgjengelig. Sjekk Supabase Storage-oppsett." },
            { status: 503 },
          );
        }

        const result = await addPinContent({
          pinId,
          type: type as "IMAGE" | "VIDEO" | "AUDIO",
          textContent,
          mediaUrl: uploaded.url,
          authorAlias,
          autoApprove: moderation.autoApprove,
        });

        if (!result) {
          return NextResponse.json({ error: "Kunne ikke lagre innhold." }, { status: 500 });
        }

        created.push(result);
      }

      const count = created.length;
      const allAutoApproved = created.every((item) => !item?.pending);
      const message = allAutoApproved
        ? count === 1
          ? "Innhold publisert!"
          : `${count} bilder publisert!`
        : count === 1
          ? "Sendt — vises når godkjent."
          : `Sendt ${count} bilder — vises når godkjent.`;

      return NextResponse.json(
        {
          content: created[0]?.content,
          contents: created.map((item) => item!.content),
          pending: !allAutoApproved,
          message,
        },
        { status: 201 },
      );
    }

    const body = await request.json();
    const parsed = jsonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig innhold." }, { status: 400 });
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
      return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
    }

    const moderation = await moderateTexts([
      parsed.data.textContent,
      parsed.data.authorAlias ?? "",
    ]);

    if (!moderation.approved) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    const result = await addPinContent({
      pinId,
      type: "TEXT",
      textContent: parsed.data.textContent,
      authorAlias: parsed.data.authorAlias,
      autoApprove: moderation.autoApprove,
    });

    if (!result) {
      return NextResponse.json({ error: "Kunne ikke lagre innhold." }, { status: 500 });
    }

    return NextResponse.json(
      {
        content: result.content,
        pending: result.pending,
        message: "Innhold publisert!",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
