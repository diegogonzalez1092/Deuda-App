import Link from "next/link";
import { getSession } from "../src/auth/session";

export default async function Home() {
  const session = await getSession();

  return (
    <>
      <section className="hero">
        <h1>Refinanciación y consolidación de pasivos</h1>
        <p>
          Consultá gratis tu situación crediticia en el BCRA y accedé a ofertas de
          refinanciación pre-cargadas por entidades acreedoras. Sin trámites, sin
          costo por consultar.
        </p>
        <div className="hero-actions">
          {session ? (
            <Link href="/dashboard" className="btn btn-primary">
              Ver mi situación actualizada
            </Link>
          ) : (
            <Link href="/consulta" className="btn btn-primary">
              Consultar mi situación
            </Link>
          )}
        </div>
      </section>

      <main className="page">
        <section className="card">
          <h2>Cómo funciona</h2>
          <ol>
            <li>
              Ingresás tu DNI/CUIT/CUIL — la Central de Deudores del BCRA es un
              registro público, no necesitás crear una contraseña.
            </li>
            <li>Te mostramos tu situación (1 a 5) y tus deudas activas por entidad.</li>
            <li>
              Si hay una oferta de regularización disponible para alguna, la ves
              con su condición y la pagás online.
            </li>
          </ol>
        </section>
      </main>
    </>
  );
}
