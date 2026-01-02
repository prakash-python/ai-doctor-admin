export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-red-600 mb-4">403</h1>
        <p className="text-2xl font-bold text-gray-800 mb-2">
          Access Denied
        </p>
        <p className="text-gray-500">
          You don’t have permission to view this page.
        </p>
      </div>
    </div>
  );
}
