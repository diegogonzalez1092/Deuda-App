"use client";

import { useActionState } from "react";
import { consultarSituacion, type ConsultaFormState } from "./actions";

const initialState: ConsultaFormState = { error: null };

export default function ConsultaPage() {
  const [state, formAction, pending] = useActionState(consultarSituacion, initialState);

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
        <div className="field">
          <label htmlFor="identificacion">DNI / CUIT / CUIL</label>
          <input
            id="identificacion"
            name="identificacion"
            inputMode="numeric"
            placeholder="20304050607"
            required
          />
        </div>
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
