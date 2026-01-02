export default function ProtectedNotFound() {
  return (
    <div className="h-[80vh] flex items-center justify-center w-full">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
        <p className="text-xl font-bold text-gray-600 mb-2">
          Page not implemented
        </p>
        <p className="text-gray-400">
          This feature is under development.
        </p>
      </div>
    </div>
  );
}
