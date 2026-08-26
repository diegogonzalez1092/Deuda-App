"use client";

import { useActionState, useState } from "react";
import { consultarSituacion, type ConsultaFormState } from "./actions";

const initialState: ConsultaFormState = { error: null };

export default function ConsultaPage() {
  const [state, formAction, pending] = useActionState(consultarSituacion, initialState);
  const [modo, setModo] = useState<"cuit" | "dni">("cuit");

  return (
    <main className="page">
      <h1>Consultá tu situación</h1>
      <p className="disclaimer">
        Consultá tu propio DNI/CUIT/CUIL, o el de un tercero solo con su autorización.
        Esta información es pública en el sitio del BCRA — no hace falta esta app para
        verla, pero acá además te mostramos ofertas de regularización si existen.
      </p>

      {state.error && <p className="form-error">{state.error}</p>}

      <form action={formAction}>
        <div className="field" role="radiogroup" aria-label="Cómo querés identificarte">
          <label>
            <input
              type="radio"
              name="modo"
              value="cuit"
              checked={modo === "cuit"}
              onChange={() => setModo("cuit")}
            />{" "}
            Tengo mi CUIT/CUIL
          </label>
          <label>
            <input
              type="radio"
              name="modo"
              value="dni"
              checked={modo === "dni"}
              onChange={() => setModo("dni")}
            />{" "}
            Solo tengo mi DNI
          </label>
        </div>

        {modo === "cuit" ? (
          <div className="field">
            <label htmlFor="identificacion">CUIT / CUIL / CDI</label>
            <input
              id="identificacion"
              name="identificacion"
              inputMode="numeric"
              placeholder="20304050607"
              required
            />
          </div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="dni">DNI</label>
              <input id="dni" name="dni" inputMode="numeric" placeholder="30405060" required />
            </div>
            <div className="field">
              <label htmlFor="sexo">Sexo registrado en tu DNI</label>
              <select id="sexo" name="sexo" required defaultValue="">
                <option value="" disabled>
                  Seleccioná una opción
                </option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <p className="disclaimer">
              Lo usamos solo para calcular tu CUIL (no se guarda). Si el resultado no
              coincide con vos, ingresá tu CUIT/CUIL directamente.
            </p>
          </>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="vos@ejemplo.com" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Consultando..." : "Consultar mi situación"}
        </button>
      </form>
    </main>
  );
}
