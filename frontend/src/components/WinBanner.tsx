import { useState, useEffect } from "react";
import { Gift } from "lucide-react";

const MESSAGES = [
  "Un visiteur vient de gagner un bon d'achat !",
  "Quelqu'un a remporté un cadeau FoxTown !",
  "Un heureux gagnant vient de décrocher un bon !",
];

export default function WinBanner() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const delay = 15000 + Math.random() * 30000;
    const timer = setTimeout(() => {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

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
