"use client";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-extrabold tracking-tighter bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Vital</span>
      <span className="font-extrabold tracking-tighter text-foreground">a</span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={`w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md ${className || ""}`}>
      <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2C9.03 2 5 6.03 5 11C5 14.97 7.97 18 12 18H16C20.03 18 23 14.97 23 11C23 6.03 18.97 2 14 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11L14 17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M11 14L17 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
