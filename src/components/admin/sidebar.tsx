"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Ticket, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Reservierungen", href: "/admin/reservierungen", icon: Ticket },
  { title: "Einstellungen", href: "/admin/einstellungen", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="hidden w-60 border-r bg-muted/30 md:block">
      <div className="flex h-full flex-col p-4">
        <p className="mb-6 px-2 text-sm font-semibold text-muted-foreground">
          Admin
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  )
}
