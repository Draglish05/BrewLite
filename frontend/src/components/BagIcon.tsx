// Icon túi mua hàng (dùng cho giỏ hàng)
type BagIconProps = {
  className: string; // class Tailwind, ví dụ 'h-6 w-6'
};

export default function BagIcon({ className }: BagIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
