"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { PersonnelCardDTO, PersonnelCardInput } from "@/types/personnel";

interface EditablePersonnelCard {
  localId: string;
  id?: number;
  displayOrder: number;
  registryId: string;
  fullName: string;
  role: string;
  status: string;
}

interface PersonnelAdminSectionProps {
  initialCards: PersonnelCardDTO[];
}

function sortCards(cards: EditablePersonnelCard[]): EditablePersonnelCard[] {
  return cards.sort((a, b) => a.displayOrder - b.displayOrder || a.localId.localeCompare(b.localId));
}

function toEditable(card: PersonnelCardDTO): EditablePersonnelCard {
  return {
    localId: `personnel-${card.id}`,
    id: card.id,
    displayOrder: card.displayOrder,
    registryId: card.registryId,
    fullName: card.fullName,
    role: card.role,
    status: card.status,
  };
}

function createDraftCard(nextOrder: number): EditablePersonnelCard {
  return {
    localId: `personnel-draft-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    displayOrder: nextOrder,
    registryId: "SCU-███",
    fullName: "",
    role: "",
    status: "Активен",
  };
}

function toPayload(card: EditablePersonnelCard): PersonnelCardInput {
  return {
    displayOrder: Number.isFinite(card.displayOrder) ? card.displayOrder : 0,
    registryId: card.registryId.trim(),
    fullName: card.fullName.trim(),
    role: card.role.trim(),
    status: card.status.trim(),
  };
}

export default function PersonnelAdminSection({ initialCards }: PersonnelAdminSectionProps) {
  const router = useRouter();

  const [cards, setCards] = useState<EditablePersonnelCard[]>(() => sortCards(initialCards.map(toEditable)));
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(() =>
    initialCards[0] ? `personnel-${initialCards[0].id}` : null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCard = useMemo(() => cards.find((card) => card.localId === selectedLocalId) ?? null, [cards, selectedLocalId]);

  const setCardState = (updater: (current: EditablePersonnelCard) => EditablePersonnelCard) => {
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
      const response = await fetch("/api/admin/personnel");
      if (!response.ok) {
        throw new Error("Не удалось загрузить карточки.");
      }
      const data = (await response.json()) as { cards: PersonnelCardDTO[] };
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
    if (!payload.registryId || !payload.fullName || !payload.role || !payload.status) {
      setError("Поля registryId/fullName/role/status обязательны.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const isNew = !selectedCard.id;
      const response = await fetch(isNew ? "/api/admin/personnel" : `/api/admin/personnel/${selectedCard.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { card?: PersonnelCardDTO; error?: string } | null;
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
        const response = await fetch(`/api/admin/personnel/${selectedCard.id}`, {
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
            <strong>Карточки кадров</strong>
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
                <span>{card.fullName || "(без имени)"}</span>
                <small>
                  ID: {card.registryId} | Order: {card.displayOrder}
                </small>
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
                  registryId
                  <input
                    value={selectedCard.registryId}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        registryId: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  fullName
                  <input
                    value={selectedCard.fullName}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        fullName: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="admin-row-grid">
                <label>
                  role
                  <input
                    value={selectedCard.role}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        role: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  status
                  <input
                    value={selectedCard.status}
                    onChange={(event) =>
                      setCardState((card) => ({
                        ...card,
                        status: event.target.value,
                      }))
                    }
                  />
                </label>
                <div />
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
