"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface AdminLoginOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminLoginOverlay({ open, onClose }: AdminLoginOverlayProps) {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setError(null);
      return;
    }

    setLogin("");
    setPassword("");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "ACCESS DENIED");
        setSubmitting(false);
        return;
      }

      onClose();
      router.push("/admin");
      router.refresh();
    } catch {
      setError("NETWORK LINK FAILURE");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-backdrop" role="dialog" aria-modal="true" aria-label="Admin login">
      <div className="admin-login-panel">
        <p className="login-line">SCU//INTERNAL.AUTH</p>
        <p className="login-line">BOOT SECTOR VERIFIED</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            LOGIN
            <input
              name="login"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            PASSWORD
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <div className="admin-login-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "VERIFYING..." : "ENTER"}
            </button>
            <button type="button" onClick={onClose} disabled={submitting}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
