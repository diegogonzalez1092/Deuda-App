"use client";

import { useActionState } from "react";
import { enviarConsultaAsesor, type AsesorFormState } from "./actions";

const initialState: AsesorFormState = { error: null, enviado: false };

export function AsesorForm() {
  const [state, formAction, pending] = useActionState(enviarConsultaAsesor, initialState);

  if (state.enviado) {
    return <p className="card">Recibimos tu consulta. Te vamos a contactar a la brevedad.</p>;
  }

  return (
    <form action={formAction}>
      {state.error && <p className="form-error">{state.error}</p>}
      <div className="field">
        <label htmlFor="mensaje">¿En qué te podemos ayudar?</label>
        <textarea id="mensaje" name="mensaje" rows={4} required />
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
