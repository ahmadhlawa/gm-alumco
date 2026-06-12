export function PlaceholderAdminPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-brand-silver">
        هذه الصفحة قيد التطوير وستتوفر قريباً. (واجهة بديلة).
      </p>
    </div>
  );
}
