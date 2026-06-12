export function AdminStatusBadge({ status, activeLabel = 'نشط', inactiveLabel = 'غير نشط' }: { status: boolean, activeLabel?: string, inactiveLabel?: string }) {
  if (status) {
    return (
      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">
        {activeLabel}
      </span>
    );
  }
  return (
    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-xs font-medium">
      {inactiveLabel}
    </span>
  );
}
