"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RichTextEditor from "@/components/admin/RichTextEditor";
import type { PartnerCardDTO, PartnerCardInput } from "@/types/partners";
import { createEmptyRichDoc, type RichDoc } from "@/types/psi";

interface EditablePartnerBullet {
  id?: number;
  displayOrder: number;
  contentDoc: RichDoc;
}

interface EditablePartnerCard {
  localId: string;
  id?: number;
  displayOrder: number;
  title: string;
  titleHref: string;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: EditablePartnerBullet[];
}

interface PartnersAdminSectionProps {
  initialCards: PartnerCardDTO[];
}

function sortCards(cards: EditablePartnerCard[]): EditablePartnerCard[] {
  return cards.sort((a, b) => a.displayOrder - b.displayOrder || a.localId.localeCompare(b.localId));
}

function toEditable(card: PartnerCardDTO): EditablePartnerCard {
  return {
    localId: `partner-${card.id}`,
    id: card.id,
    displayOrder: card.displayOrder,
    title: card.title,
    titleHref: card.titleHref || "",
    introDoc: card.introDoc,
    conclusionDoc: card.conclusionDoc,
    bullets: card.bullets.map((bullet) => ({
      id: bullet.id,
      displayOrder: bullet.displayOrder,
      contentDoc: bullet.contentDoc,
    })),
  };
}

function createDraftCard(nextOrder: number): EditablePartnerCard {
  return {
    localId: `partner-draft-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    displayOrder: nextOrder,
    title: "",
    titleHref: "",
    introDoc: createEmptyRichDoc(),
    conclusionDoc: createEmptyRichDoc(),
    bullets: [
      {
        displayOrder: 10,
        contentDoc: createEmptyRichDoc(),
      },
    ],
  };
}

function toPayload(card: EditablePartnerCard): PartnerCardInput {
  return {
    displayOrder: Number.isFinite(card.displayOrder) ? card.displayOrder : 0,
    title: card.title.trim(),
    titleHref: card.titleHref.trim() || null,
    introDoc: card.introDoc,
    conclusionDoc: card.conclusionDoc,
    bullets: card.bullets.map((bullet, index) => ({
      displayOrder: bullet.displayOrder || (index + 1) * 10,
      contentDoc: bullet.contentDoc,
    })),
  };
}

export default function PartnersAdminSection({ initialCards }: PartnersAdminSectionProps) {
  const router = useRouter();

  const [cards, setCards] = useState<EditablePartnerCard[]>(() => sortCards(initialCards.map(toEditable)));
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(() =>
    initialCards[0] ? `partner-${initialCards[0].id}` : null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCard = useMemo(() => cards.find((card) => card.localId === selectedLocalId) ?? null, [cards, selectedLocalId]);

  const setCardState = (updater: (current: EditablePartnerCard) => EditablePartnerCard) => {
    if (!selectedCard) {
      return;
    }

    setCards((prev) =>
      prev.map((card) => {
        if (card.localId !== selectedCard.localId) {
          return card;
        }
        return updater(card);
      }),
    );
  };

  const handleCreateCard = () => {
    const nextOrder = cards.length ? Math.max(...cards.map((card) => card.displayOrder)) + 10 : 10;
    const draft = createDraftCard(nextOrder);
    setCards((prev) => sortCards([...prev, draft]));
    setSelectedLocalId(draft.localId);
    setMessage("Создана новая черновая карточка.");
    setError(null);
  };

  const handleReload = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/partners");
      if (!response.ok) {
        throw new Error("Не удалось загрузить карточки.");
      }
      const data = (await response.json()) as { cards: PartnerCardDTO[] };
      const mapped = sortCards(data.cards.map(toEditable));
      setCards(mapped);
      setSelectedLocalId(mapped[0]?.localId || null);
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : "Ошибка загрузки.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCard) {
      return;
    }

    const payload = toPayload(selectedCard);
    if (!payload.title) {
      setError("Поле title обязательно.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const isNew = !selectedCard.id;
      const response = await fetch(isNew ? "/api/admin/partners" : `/api/admin/partners/${selectedCard.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { card?: PartnerCardDTO; error?: string } | null;
      if (!response.ok || !data?.card) {
        throw new Error(data?.error || "Ошибка сохранения.");
      }

      const saved = toEditable(data.card);
      setCards((prev) => {
        const next = isNew
          ? [...prev.filter((card) => card.localId !== selectedCard.localId), saved]
          : prev.map((card) => (card.localId === selectedCard.localId ? saved : card));
        return sortCards(next);
      });
      setSelectedLocalId(saved.localId);
      setMessage("Карточка сохранена.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Ошибка сохранения.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (selectedCard.id) {
        const response = await fetch(`/api/admin/partners/${selectedCard.id}`, {
          method: "DELETE",
        });
        const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || "Ошибка удаления.");
        }
      }

      const nextCards = cards.filter((card) => card.localId !== selectedCard.localId);
      setCards(nextCards);
      setSelectedLocalId(nextCards[0]?.localId || null);
      setMessage("Карточка удалена.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Ошибка удаления.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-psi-layout">
        <aside className="admin-psi-list">
          <div className="admin-psi-list-head">
            <strong>Карточки партнёров</strong>
            <button type="button" onClick={handleCreateCard}>
              + Новая
            </button>
          </div>

          <div className="admin-psi-list-items">
            {cards.map((card) => (
              <button
                key={card.localId}
                className={`admin-psi-list-item ${selectedLocalId === card.localId ? "active" : ""}`}
                type="button"
                onClick={() => setSelectedLocalId(card.localId)}
              >
                <span>{card.title || "(без названия)"}</span>
                <small>Order: {card.displayOrder}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="admin-psi-editor">
          {!selectedCard ? (
            <p>Выберите карточку или создайте новую.</p>
          ) : (
            <>
              <div className="admin-row-grid">
                <label>
                  displayOrder
                  <input
                    type="number"
                    value={selectedCard.displayOrder}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        displayOrder: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </label>
                <label>
                  title
                  <input
                    value={selectedCard.title}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  titleHref
                  <input
                    placeholder="/psi"
                    value={selectedCard.titleHref}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        titleHref: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="admin-editor-block">
                <p>intro</p>
                <RichTextEditor
                  value={selectedCard.introDoc}
                  onChange={(introDoc) =>
                    setCardState((card) => ({
                      ...card,
                      introDoc,
                    }))
                  }
                />
              </div>

              <div className="admin-editor-block">
                <div className="admin-bullets-head">
                  <p>bullets</p>
                  <button
                    type="button"
                    onClick={() =>
                      setCardState((card) => ({
                        ...card,
                        bullets: [
                          ...card.bullets,
                          {
                            displayOrder: (card.bullets.length + 1) * 10,
                            contentDoc: createEmptyRichDoc(),
                          },
                        ],
                      }))
                    }
                  >
                    + bullet
                  </button>
                </div>

                {selectedCard.bullets.map((bullet, index) => (
                  <div key={`${bullet.id ?? "new"}-${index}`} className="admin-bullet-editor">
                    <div className="admin-bullet-controls">
                      <label>
                        Order
                        <input
                          type="number"
                          value={bullet.displayOrder}
                          onChange={(event) =>
                            setCardState((card) => ({
                              ...card,
                              bullets: card.bullets.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, displayOrder: Number(event.target.value) || 0 }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setCardState((card) => ({
                            ...card,
                            bullets: card.bullets.filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }
                      >
                        Delete
                      </button>
                    </div>
                    <RichTextEditor
                      value={bullet.contentDoc}
                      onChange={(contentDoc) =>
                        setCardState((card) => ({
                          ...card,
                          bullets: card.bullets.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, contentDoc } : item,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="admin-editor-block">
                <p>conclusion</p>
                <RichTextEditor
                  value={selectedCard.conclusionDoc}
                  onChange={(conclusionDoc) =>
                    setCardState((card) => ({
                      ...card,
                      conclusionDoc,
                    }))
                  }
                />
              </div>

              <div className="admin-actions-row">
                <button type="button" onClick={handleSave} disabled={busy}>
                  {busy ? "SAVING..." : "Save"}
                </button>
                <button type="button" onClick={handleDelete} disabled={busy}>
                  Delete
                </button>
                <button type="button" onClick={() => void handleReload()} disabled={busy}>
                  Reload
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {error ? <div className="admin-status error">{error}</div> : null}
      {message ? <div className="admin-status ok">{message}</div> : null}
    </>
  );
}
