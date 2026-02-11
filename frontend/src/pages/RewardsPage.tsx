import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Gift, Copy, Check } from "lucide-react";

interface Reward {
  id: number;
  prize: string;
  voucherCode: string;
  playedAt: string;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      apiFetch<Reward[]>("/game/rewards").then(setRewards).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="text-fox-orange" size={28} />
        <h1 className="text-3xl font-bold text-gray-800">Mes récompenses</h1>
      </div>

      {rewards.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">Vous n'avez pas encore gagné de récompenses.</p>
          <p className="text-sm text-gray-400 mt-1">Tentez votre chance au jeu quotidien sur la page d'accueil !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{reward.prize}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Gagné le {new Date(reward.playedAt).toLocaleDateString("fr-CH")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm bg-orange-50 text-fox-orange px-3 py-1.5 rounded border border-orange-200">
                  {reward.voucherCode}
                </span>
                <button
                  onClick={() => copyCode(reward.id, reward.voucherCode)}
                  className="text-gray-400 hover:text-fox-orange transition"
                  title="Copier le code"
                >
                  {copiedId === reward.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
