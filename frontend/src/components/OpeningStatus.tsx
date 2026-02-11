import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const OPEN_HOUR = 11;
const CLOSE_HOUR = 19;

function getStatus() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  if (h >= OPEN_HOUR && h < CLOSE_HOUR) {
    const remaining = (CLOSE_HOUR - h - 1) * 60 + (60 - m);
    const rh = Math.floor(remaining / 60);
    const rm = remaining % 60;
    return {
      open: true,
      text: rh > 0 ? `Ferme dans ${rh}h${rm.toString().padStart(2, "0")}` : `Ferme dans ${rm}min`,
    };
  }

  if (h < OPEN_HOUR) {
    const remaining = (OPEN_HOUR - h - 1) * 60 + (60 - m);
    const rh = Math.floor(remaining / 60);
    const rm = remaining % 60;
    return {
      open: false,
      text: rh > 0 ? `Ouvre dans ${rh}h${rm.toString().padStart(2, "0")}` : `Ouvre dans ${rm}min`,
    };
  }

  return {
    open: false,
    text: `Ouvre demain à ${OPEN_HOUR}h`,
  };
}

export default function OpeningStatus() {
  const [status, setStatus] = useState(getStatus);

  useEffect(() => {
    const interval = setInterval(() => setStatus(getStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Clock size={14} className={status.open ? "text-green-500" : "text-gray-400"} />
      <span className={status.open ? "text-green-600 font-medium" : "text-gray-500"}>
        {status.open ? "Ouvert" : "Fermé"}
      </span>
      <span className="text-gray-400">&middot;</span>
      <span className="text-gray-500">{status.text}</span>
    </div>
  );
}
