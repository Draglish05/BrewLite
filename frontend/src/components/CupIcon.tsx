// Hình ly đơn giản: hình thang úp ngược (đáy nhỏ, miệng to) + ống hút
// color: màu nước trong ly

type CupIconProps = {
  color: string; // màu nước, ví dụ '#8fb36a'
  className: string; // class Tailwind, ví dụ 'h-20'
};

export default function CupIcon({ color, className }: CupIconProps) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      {/* Ống hút: cắm xiên vào ly */}
      <line x1="58" y1="40" x2="70" y2="6" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />

      {/* Nước trong ly (cũng là hình thang, thấp hơn miệng ly) */}
      <polygon points="23,44 77,44 69,108 31,108" fill={color} />

      {/* Thân ly: hình thang úp ngược, chỉ có viền */}
      <polygon
        points="18,30 82,30 72,110 28,110"
        fill="none"
        stroke="#d9c9cd"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Vệt sáng nhỏ cho ly trông có chiều sâu */}
      <line x1="27" y1="40" x2="33" y2="98" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
