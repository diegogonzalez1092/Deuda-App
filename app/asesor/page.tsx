import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "../../src/auth/session";
import { AsesorForm } from "./AsesorForm";

export default async function AsesorPage() {
  const session = await getSession();
  if (!session) {
    redirect("/consulta");
  }

  return (
    <main className="page">
      <h1>Consultar con un asesor</h1>
      <p className="disclaimer">
        Dejanos tu consulta y te contactamos a {session.email}. Esto es distinto de la
        gestoría activa (negociar tu deuda en tu nombre frente a la entidad) — ese servicio
        todavía no está habilitado.
      </p>
      <AsesorForm />
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard">Volver a mi situación</Link>
      </p>
    </main>
  );
}
