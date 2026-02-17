"use client";

interface TopHeaderProps {
  onBadgeClick?: () => void;
}

export default function TopHeader({ onBadgeClick }: TopHeaderProps) {
  return (
    <div className="header">
      <div className="header-text">
        <div className="title">Special Cases Unit (SCU)</div>
        <div>Seoul Metropolitan Police Agency</div>
        <div className="subtitle">Internal Network</div>
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
