import { requireAdminAccess } from "@/lib/auth/admin"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminAccess()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8">{children}</div>
    </div>
  )
}
