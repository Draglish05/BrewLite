'use client';

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div>
      <p>Không tải được menu. Vui lòng thử lại.</p>
      <button onClick={retry}>Thử lại</button>
    </div>
  );
}
