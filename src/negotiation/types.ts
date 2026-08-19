export type NegotiationCaseStatus = "abierto" | "en_negociacion" | "cerrado";

export interface NegotiationMessage {
  autor: "usuario" | "gestor";
  texto: string;
  fecha: string; // ISO date
}

export interface NegotiationCase {
  id: string;
  identificacionUsuario: string;
  entidad: string;
  montoDeuda: number;
  estado: NegotiationCaseStatus;
  mensajes: NegotiationMessage[];
  creadoEn: string; // ISO date
  cerradoEn: string | null;
}
