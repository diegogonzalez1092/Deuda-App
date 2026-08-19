"use server";

import { redirect } from "next/navigation";
import { clearSession } from "../../src/auth/session";

export async function cerrarSesion(): Promise<void> {
  await clearSession();
  redirect("/");
}
