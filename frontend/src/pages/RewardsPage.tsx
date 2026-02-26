import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Gift, Copy, Check, QrCode } from "lucide-react";

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
  const [qrId, setQrId] = useState<number | null>(null);

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
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50">
              <Gift className="text-fox-orange" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes récompenses</h1>
              <p className="text-sm text-gray-400">{rewards.length} bon{rewards.length > 1 ? "s" : ""} gagné{rewards.length > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {rewards.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
              <Gift size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aucune récompense pour l'instant</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Tentez votre chance au jeu quotidien !</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-fox-orange text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Jouer maintenant
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{reward.prize}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Gagné le {new Date(reward.playedAt).toLocaleDateString("fr-CH")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm bg-orange-50 text-fox-orange px-3 py-1.5 rounded-lg border border-orange-100">
                      {reward.voucherCode}
                    </span>
                    <button
                      onClick={() => copyCode(reward.id, reward.voucherCode)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-fox-orange hover:bg-orange-50 transition-colors"
                      title="Copier le code"
                    >
                      {copiedId === reward.id ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => setQrId(qrId === reward.id ? null : reward.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        qrId === reward.id
                          ? "text-fox-orange bg-orange-50"
                          : "text-gray-400 hover:text-fox-orange hover:bg-orange-50"
                      }`}
                      title="Afficher le QR code"
                    >
                      <QrCode size={16} />
                    </button>
                  </div>
                </div>
                {qrId === reward.id && (
                  <div className="border-t border-gray-100 p-5 flex flex-col items-center gap-3 bg-gray-50">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(reward.voucherCode)}`}
                      alt={`QR ${reward.voucherCode}`}
                      className="w-40 h-40 rounded-xl"
                    />
                    <p className="text-xs text-gray-400">Présentez ce code en caisse</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
