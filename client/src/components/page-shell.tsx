import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

// Shared paper background + title used by every page.
export default function PageShell({ title, children, showTopImage = true }: { title: ReactNode; children: ReactNode; showTopImage?: boolean }) {
  return (
    <div className="min-h-screen bg-background relative isolate">
      {/* Background images - sit behind all content */}
      {showTopImage && (
      <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <img
          src={`${import.meta.env.BASE_URL}assets/recipe-top.png`}
          alt=""
          style={{ width: '100%', minWidth: '1280px', display: 'block', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -2, backgroundImage: `url(${import.meta.env.BASE_URL}assets/recipe-grid-2.jpg)`, backgroundRepeat: 'repeat', backgroundSize: 'contain' }} />

      {title}
      {children}
    </div>
  );
}

export function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <header className="py-16 px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="relative">
          <img
            src={`${import.meta.env.BASE_URL}assets/recipe-title-accent.png`}
            alt=""
            className="w-full pointer-events-none"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <h1 className="page-title text-7xl font-normal text-foreground">{children}</h1>
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}

// Minimal header for inner pages: just a back link in the top left.
export function CompactHeader({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <header className="compact-header">
      <Link href={backHref} className="grocery-back-link">
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
    </header>
  );
}
