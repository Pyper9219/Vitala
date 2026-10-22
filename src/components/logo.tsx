"use client";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-primary font-bold tracking-tighter">VITA</span>
      <span className="text-foreground font-semibold tracking-tighter">la</span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2C9.03 2 5 6.03 5 11C5 14.97 7.97 18 12 18H16C20.03 18 23 14.97 23 11C23 6.03 18.97 2 14 2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11L14 17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M11 14L17 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
