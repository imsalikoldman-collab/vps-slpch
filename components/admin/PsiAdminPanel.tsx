"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RichTextEditor from "@/components/admin/RichTextEditor";
import { createEmptyRichDoc, type PsiCardDTO, type PsiCardInput, type RichDoc } from "@/types/psi";

type AdminSection = "psi" | "personnel" | "cases" | "partners";

interface EditableBullet {
  id?: number;
  displayOrder: number;
  contentDoc: RichDoc;
}

interface EditableCard {
  localId: string;
  id?: number;
  displayOrder: number;
  name: string;
  nameHref: string;
  age: string;
  citizenship: string;
  status: string;
  photoPath: string;
  photoAlt: string;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: EditableBullet[];
}

interface PsiAdminPanelProps {
  initialCards: PsiCardDTO[];
}

function toEditable(card: PsiCardDTO): EditableCard {
  return {
    localId: `card-${card.id}`,
    id: card.id,
    displayOrder: card.displayOrder,
    name: card.name,
    nameHref: card.nameHref || "",
    age: card.age === null ? "" : String(card.age),
    citizenship: card.citizenship,
    status: card.status,
    photoPath: card.photoPath || "",
    photoAlt: card.photoAlt || "",
    introDoc: card.introDoc,
    conclusionDoc: card.conclusionDoc,
    bullets: card.bullets.map((bullet) => ({
      id: bullet.id,
      displayOrder: bullet.displayOrder,
      contentDoc: bullet.contentDoc,
    })),
  };
}

function createDraftCard(nextOrder: number): EditableCard {
  return {
    localId: `draft-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    displayOrder: nextOrder,
    name: "",
    nameHref: "",
    age: "",
    citizenship: "Республика Корея",
    status: "под наблюдением",
    photoPath: "",
    photoAlt: "",
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

function toPayload(card: EditableCard): PsiCardInput {
  return {
    displayOrder: Number.isFinite(card.displayOrder) ? card.displayOrder : 0,
    name: card.name.trim(),
    nameHref: card.nameHref.trim() || null,
    age: card.age.trim() ? Number(card.age) : null,
    citizenship: card.citizenship.trim(),
    status: card.status.trim(),
    photoPath: card.photoPath.trim() || null,
    photoAlt: card.photoAlt.trim() || null,
    introDoc: card.introDoc,
    conclusionDoc: card.conclusionDoc,
    bullets: card.bullets.map((bullet, index) => ({
      displayOrder: bullet.displayOrder || (index + 1) * 10,
      contentDoc: bullet.contentDoc,
    })),
  };
}

function toPhotoUrl(photoPath: string): string | null {
  if (!photoPath.trim()) {
    return null;
  }
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  if (photoPath.startsWith("psi/")) {
    return `/api/media/psi/${encodeURIComponent(photoPath.slice(4))}`;
  }
  return null;
}

export default function PsiAdminPanel({ initialCards }: PsiAdminPanelProps) {
  const router = useRouter();

  const [section, setSection] = useState<AdminSection>("psi");
  const [cards, setCards] = useState<EditableCard[]>(() =>
    initialCards.map(toEditable).sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(() => (initialCards[0] ? `card-${initialCards[0].id}` : null));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCard = useMemo(
    () => cards.find((card) => card.localId === selectedLocalId) ?? null,
    [cards, selectedLocalId],
  );

  const setCardState = (updater: (current: EditableCard) => EditableCard) => {
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
    setCards((prev) => [...prev, draft].sort((a, b) => a.displayOrder - b.displayOrder));
    setSelectedLocalId(draft.localId);
    setMessage("Создана новая черновая карточка.");
    setError(null);
  };

  const handleReload = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/psi");
      if (!response.ok) {
        throw new Error("Не удалось загрузить карточки.");
      }
      const data = (await response.json()) as { cards: PsiCardDTO[] };
      const mapped = data.cards.map(toEditable).sort((a, b) => a.displayOrder - b.displayOrder);
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
    if (!payload.name || !payload.citizenship || !payload.status) {
      setError("Поля name/citizenship/status обязательны.");
      return;
    }

    if (payload.age !== null && Number.isNaN(payload.age)) {
      setError("Поле age должно быть числом.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const isNew = !selectedCard.id;
      const response = await fetch(isNew ? "/api/admin/psi" : `/api/admin/psi/${selectedCard.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { card?: PsiCardDTO; error?: string } | null;
      if (!response.ok || !data?.card) {
        throw new Error(data?.error || "Ошибка сохранения.");
      }

      const saved = toEditable(data.card);
      setCards((prev) => {
        const next = isNew
          ? [...prev.filter((card) => card.localId !== selectedCard.localId), saved]
          : prev.map((card) => (card.localId === selectedCard.localId ? saved : card));
        return next.sort((a, b) => a.displayOrder - b.displayOrder);
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
        const response = await fetch(`/api/admin/psi/${selectedCard.id}`, {
          method: "DELETE",
        });
        const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || "Ошибка удаления.");
        }
      }

      setCards((prev) => prev.filter((card) => card.localId !== selectedCard.localId));
      setSelectedLocalId((prev) => {
        if (prev !== selectedCard.localId) {
          return prev;
        }
        const remaining = cards.filter((card) => card.localId !== selectedCard.localId);
        return remaining[0]?.localId || null;
      });
      setMessage("Карточка удалена.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Ошибка удаления.");
    } finally {
      setBusy(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!selectedCard) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/admin/upload/photo", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as { photoPath?: string; error?: string } | null;
      if (!response.ok || !data?.photoPath) {
        throw new Error(data?.error || "Ошибка загрузки фото.");
      }

      setCardState((card) => ({
        ...card,
        photoPath: data.photoPath || "",
      }));
      setMessage("Фото загружено. Сохраните карточку.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки фото.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <section className="page content admin-page">
      <div className="admin-header-row">
        <h2>Панель администратора</h2>
        <button className="admin-logout-btn" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-section-tabs">
        <button className={section === "psi" ? "active" : ""} onClick={() => setSection("psi")} type="button">
          Лица особого интереса
        </button>
        <button className={section === "personnel" ? "active" : ""} onClick={() => setSection("personnel")} type="button">
          Кадровый реестр
        </button>
        <button className={section === "cases" ? "active" : ""} onClick={() => setSection("cases")} type="button">
          Архив материалов дел
        </button>
        <button className={section === "partners" ? "active" : ""} onClick={() => setSection("partners")} type="button">
          Сотрудничающие организации
        </button>
      </div>

      {section !== "psi" ? (
        <div className="admin-module-placeholder">Модуль в миграции</div>
      ) : (
        <div className="admin-psi-layout">
          <aside className="admin-psi-list">
            <div className="admin-psi-list-head">
              <strong>Карточки PSI</strong>
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
                  <span>{card.name || "(без имени)"}</span>
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
                    name
                    <input
                      value={selectedCard.name}
                      onChange={(event) =>
                        setCardState((card) => ({
                          ...card,
                          name: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    nameHref
                    <input
                      placeholder="/cases"
                      value={selectedCard.nameHref}
                      onChange={(event) =>
                        setCardState((card) => ({
                          ...card,
                          nameHref: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="admin-row-grid">
                  <label>
                    age
                    <input
                      type="number"
                      value={selectedCard.age}
                      onChange={(event) =>
                        setCardState((card) => ({
                          ...card,
                          age: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    citizenship
                    <input
                      value={selectedCard.citizenship}
                      onChange={(event) =>
                        setCardState((card) => ({
                          ...card,
                          citizenship: event.target.value,
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
                </div>

                <div className="admin-photo-block">
                  <label>
                    photoPath
                    <input
                      value={selectedCard.photoPath}
                      onChange={(event) =>
                        setCardState((card) => ({
                          ...card,
                          photoPath: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    photoAlt
                    <input
                      value={selectedCard.photoAlt}
                      onChange={(event) =>
                        setCardState((card) => ({
                          ...card,
                          photoAlt: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="upload-label">
                    Upload photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleUploadPhoto(file);
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {toPhotoUrl(selectedCard.photoPath) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="admin-photo-preview" src={toPhotoUrl(selectedCard.photoPath) || ""} alt={selectedCard.photoAlt || "preview"} />
                  ) : null}
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
                            setCardState((card) => {
                              if (index === 0) {
                                return card;
                              }
                              const nextBullets = [...card.bullets];
                              const current = nextBullets[index];
                              nextBullets[index] = nextBullets[index - 1];
                              nextBullets[index - 1] = current;
                              return { ...card, bullets: nextBullets };
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCardState((card) => {
                              if (index >= card.bullets.length - 1) {
                                return card;
                              }
                              const nextBullets = [...card.bullets];
                              const current = nextBullets[index];
                              nextBullets[index] = nextBullets[index + 1];
                              nextBullets[index + 1] = current;
                              return { ...card, bullets: nextBullets };
                            })
                          }
                        >
                          ↓
                        </button>
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
      )}

      {error ? <div className="admin-status error">{error}</div> : null}
      {message ? <div className="admin-status ok">{message}</div> : null}
    </section>
  );
}
