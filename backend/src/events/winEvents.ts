import type { Response } from "express";

export interface WinEvent {
  id: string;
  message: string;
  prize: string;
  wonAt: string;
}

const clients = new Set<Response>();

export function subscribeToWinEvents(res: Response): () => void {
  // Inscrit un visiteur connecté au flux des gains en direct.
  clients.add(res);
  return () => {
    // Désinscription dès la fermeture de la connexion.
    clients.delete(res);
  };
}

export function publishWinEvent(event: WinEvent): void {
  // Format SSE envoyé au frontend pour afficher la bannière de gain.
  const payload = `id: ${event.id}\nevent: win\ndata: ${JSON.stringify(event)}\n\n`;

  for (const client of clients) {
    // Diffuse le même événement à tous les clients connectés.
    client.write(payload);
  }
}
