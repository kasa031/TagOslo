"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Star, Plus } from "lucide-react";
import type { MapPinSummary } from "@/types";
import type { SunCondition } from "@/types/sol";
import type { PinDetail } from "@/types/pin-detail";
import type { PinContentItem } from "@/types";
import { formatPinBydelLabel } from "@/lib/oslo-bydeler";
import { formatDate } from "@/lib/utils";
import { PLACE_CATEGORIES, TERRACE_FACING } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SunConditionBadge } from "@/components/map/SunConditionBadge";
import { AddContentModal } from "@/components/map/AddContentModal";
import { AddReviewForm } from "@/components/map/AddReviewForm";
import { ReportButton } from "@/components/map/ReportButton";

type PinDetailPanelProps = {
  pin: MapPinSummary;
  sunCondition?: SunCondition;
  onClose: () => void;
};

function ContentItem({ item }: { item: PinContentItem }) {
  return (
    <article className="rounded-lg border border-oslo-border p-3">
      {item.type === "TEXT" && item.textContent && (
        <p className="text-sm leading-relaxed text-oslo-ink">{item.textContent}</p>
      )}
      {item.type === "IMAGE" && item.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.mediaUrl} alt={item.textContent ?? "Bilde fra stedet"} className="max-h-48 rounded-lg object-cover" />
      )}
      {item.type === "VIDEO" && item.mediaUrl && (
        <video src={item.mediaUrl} controls className="max-h-48 w-full rounded-lg" />
      )}
      {item.type === "AUDIO" && item.mediaUrl && (
        <audio src={item.mediaUrl} controls className="w-full" />
      )}
      {item.textContent && item.type !== "TEXT" && (
        <p className="mt-2 text-sm text-oslo-ink">{item.textContent}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-oslo-muted">
          {item.authorAlias ?? "Anonym"} · {formatDate(item.createdAt)}
        </p>
        <ReportButton targetType="PIN_CONTENT" targetId={item.id} />
      </div>
    </article>
  );
}

export function PinDetailPanel({ pin, sunCondition, onClose }: PinDetailPanelProps) {
  const [detail, setDetail] = useState<PinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddContent, setShowAddContent] = useState(false);

  const [loadError, setLoadError] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`/api/pins/${pin.id}`);
      if (response.ok) {
        const data = (await response.json()) as { pin: PinDetail };
        setDetail(data.pin);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [pin.id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const categoryLabel =
    PLACE_CATEGORIES.find((c) => c.id === pin.category)?.label ?? pin.category;

  const facingLabel = detail?.terraceFacing
    ? TERRACE_FACING.find((f) => f.id === detail.terraceFacing)?.label
    : null;

  return (
    <>
      <Card className="relative max-h-[70vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 float-right rounded-lg p-1 hover:bg-oslo-blue-light"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-8 text-lg font-semibold text-oslo-ink">{pin.title}</h2>
        <p className="mt-1 text-sm text-oslo-muted">
          {formatPinBydelLabel(pin.bydel, pin.id)}
          {pin.address ? ` · ${pin.address}` : ""}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="category">{categoryLabel}</Badge>
          {facingLabel && <Badge variant="default">Terrasse: {facingLabel}</Badge>}
          {sunCondition && (
            <SunConditionBadge level={sunCondition.level} label={sunCondition.label} />
          )}
          {pin.avgRating !== null && (
            <span className="inline-flex items-center gap-1 text-sm text-oslo-ink">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {pin.avgRating.toFixed(1)} ({pin.reviewCount})
            </span>
          )}
        </div>

        {sunCondition && (
          <div className="mt-4 rounded-xl border-2 border-oslo-blue bg-oslo-blue-light p-3 text-sm">
            <p className="font-bold text-oslo-ink">Sol</p>
            <ul className="mt-2 space-y-1 text-xs font-medium text-oslo-muted">
              <li>Skydekke: {sunCondition.cloudPercent}%</li>
              <li>Solhøyde: {sunCondition.sunElevation}°</li>
              {sunCondition.temperature !== null && (
                <li>Temperatur: {sunCondition.temperature}°C</li>
              )}
            </ul>
          </div>
        )}

        {pin.description && (
          <p className="mt-4 text-sm leading-relaxed text-oslo-ink">{pin.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {pin.hashtags.map((tag) => (
            <Badge key={tag} variant="hashtag">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-oslo-border pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-oslo-ink">Innlegg</p>
            <Button variant="secondary" size="sm" onClick={() => setShowAddContent(true)}>
              <Plus className="h-4 w-4" />
              Legg til
            </Button>
          </div>

          {loadError && (
            <p className="text-sm text-oslo-red">Kunne ikke laste innhold. Prøv igjen.</p>
          )}

          {loading && <p className="text-sm text-oslo-muted">Laster …</p>}

          {!loading && detail?.contents.length === 0 && (
            <p className="text-sm text-oslo-muted">Ingen innlegg.</p>
          )}

          <div className="space-y-3">
            {detail?.contents.map((item) => (
              <ContentItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-oslo-ink">Anmeldelser</p>
          {detail?.reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-oslo-border p-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {review.comment && (
                <p className="mt-1 text-sm text-oslo-ink">{review.comment}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-oslo-muted">
                  {review.authorAlias ?? "Anonym"} · {formatDate(review.createdAt)}
                </p>
                <ReportButton targetType="PLACE_REVIEW" targetId={review.id} />
              </div>
            </div>
          ))}

          <AddReviewForm
            pinId={pin.id}
            onSuccess={() => {
              void loadDetail();
            }}
          />
        </div>
      </Card>

      {showAddContent && (
        <AddContentModal
          pinId={pin.id}
          onClose={() => setShowAddContent(false)}
          onSuccess={() => {
            setShowAddContent(false);
            void loadDetail();
          }}
        />
      )}
    </>
  );
}
