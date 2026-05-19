interface Props {
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
}

export function LocationBubble({ name, address }: Props) {
  return (
    <div style={{ fontSize: 11 }}>
      <div>📍 {name ?? '位置'}</div>
      {address && <div style={{ opacity: 0.6, marginTop: 2 }}>{address}</div>}
    </div>
  );
}
