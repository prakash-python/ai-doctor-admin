import Sidebar from "../components/Sidebar/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Offset main content by full sidebar width */}
      <main className="flex-1 ml-72">
        <div className="p-8 lg:p-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}