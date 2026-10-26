export async function postJson(path: string, body: unknown) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export function getErrorMessage(data: { message?: string | string[] }) {
  if (Array.isArray(data.message)) {
    return data.message.join(', ');
  }
  return data.message ?? 'Có lỗi xảy ra';
}
