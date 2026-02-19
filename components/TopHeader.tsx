"use client";

import { useEffect, useState } from "react";

interface TopHeaderProps {
  onBadgeClick?: () => void;
}

const DEFAULT_SEARCH_VALUE = "манифестация";

export default function TopHeader({ onBadgeClick }: TopHeaderProps) {
  const [searchValue, setSearchValue] = useState(DEFAULT_SEARCH_VALUE);
  const [showAccessCardPrompt, setShowAccessCardPrompt] = useState(false);

  useEffect(() => {
    if (!showAccessCardPrompt) {
      return;
    }

    const handleAnyKey = (event: KeyboardEvent) => {
      event.preventDefault();
      setShowAccessCardPrompt(false);
      setSearchValue(DEFAULT_SEARCH_VALUE);
    };

    window.addEventListener("keydown", handleAnyKey);

    return () => {
      window.removeEventListener("keydown", handleAnyKey);
    };
  }, [showAccessCardPrompt]);

  const handleSearchChange = (value: string) => {
    const nextValue = value.slice(0, 20);
    setSearchValue(nextValue);

    if (nextValue !== DEFAULT_SEARCH_VALUE) {
      setShowAccessCardPrompt(true);
    }
  };

  return (
    <div className="header">
      <div className="header-text">
        <div className="title">Special Cases Unit (SCU)</div>
        <div>Seoul Metropolitan Police Agency</div>
        <div className="subtitle">Internal Network</div>
      </div>

      <div className="header-search-block">
        <label className="header-search-label" htmlFor="global-search-input">
          <span className="header-search-icon" aria-hidden>⌕</span> Глобальный поиск по базе данных
        </label>
        <input
          id="global-search-input"
          className="header-search-input"
          type="text"
          value={searchValue}
          maxLength={20}
          readOnly={showAccessCardPrompt}
          onChange={(event) => handleSearchChange(event.target.value)}
        />

        {showAccessCardPrompt ? (
          <div className="header-search-lockout" role="alert" aria-live="polite">
            <p className="header-search-lockout-main">SCU//INTERNAL.NET</p>
            <p className="header-search-lockout-sub">Вставьте карту доступа</p>
          </div>
        ) : null}
      </div>

      <button className="header-logo-btn" type="button" onClick={onBadgeClick} aria-label="Open admin login">
        <div className="header-logo">
          <div className="badge">
            <div className="badge-text">
              <div>경찰</div>
              <div>POLICE</div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
