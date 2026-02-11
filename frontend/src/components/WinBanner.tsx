import { useState, useEffect } from "react";
import { Gift } from "lucide-react";

interface WinEvent {
  id: string;
  message: string;
  prize: string;
  wonAt: string;
}

export default function WinBanner() {
  // Notifie en direct les gains du jour pour créer un effet de preuve sociale.
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  // File d'attente: chaque gain réel est affiché, même s'ils arrivent à la suite.
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    // Flux temps réel des gains pour notifier tous les visiteurs connectés.
    const source = new EventSource("/api/game/wins/stream");
    const onWin = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as WinEvent;
        const nextMessage = payload.message || "Un visiteur vient de gagner un bon d'achat !";
        // On empile les messages pour les afficher un par un.
        setQueue((current) => [...current, nextMessage]);
      } catch {
        // Message générique si le payload ne peut pas être lu.
        setQueue((current) => [...current, "Un visiteur vient de gagner un bon d'achat !"]);
      }
    };

    // On réagit uniquement aux événements de type "win".
    source.addEventListener("win", onWin as EventListener);
    return () => {
      // Fermeture propre de la connexion lors du démontage du composant.
      source.removeEventListener("win", onWin as EventListener);
      source.close();
    };
  }, []);

  useEffect(() => {
    // Si une bannière est déjà visible, on attend la fin de l'affichage.
    if (visible || queue.length === 0) return;

    // Affiche le prochain gain.
    setMessage(queue[0]);
    setVisible(true);

    // Durée fixe d'affichage pour garder un rythme lisible.
    const timer = setTimeout(() => {
      setVisible(false);
      // Retire le message affiché et passe au suivant.
      setQueue((current) => current.slice(1));
    }, 4000);

    return () => clearTimeout(timer);
  }, [queue, visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] animate-slide-in">
      <div className="bg-white shadow-lg rounded-md border border-orange-200 px-4 py-3 flex items-center gap-3 max-w-xs">
        <div className="bg-fox-orange/10 p-2 rounded-md">
          <Gift size={18} className="text-fox-orange" />
        </div>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    </div>
  );
}
