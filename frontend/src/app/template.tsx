// template.tsx: Next.js tạo lại khung này mỗi lần chuyển trang,
// nên hiệu ứng "hiện dần + trượt lên" chạy lại ở mỗi trang mới (Header thì đứng yên)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
