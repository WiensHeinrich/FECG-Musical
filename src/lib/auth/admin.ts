import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function requireAdminAccess() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: isAdmin } = await supabase.rpc("is_admin")

  if (!isAdmin) {
    redirect("/login")
  }

  return user
}
