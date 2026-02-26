import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { Car, RefreshCw } from "lucide-react";
import { ParkingCardSkeleton } from "../components/Skeleton";

interface Parking {
  id: number;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
}

export default function ParkingsPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParkings = () => {
    setLoading(true);
    apiFetch<Parking[]>("/parking")
      .then(setParkings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return { text: "text-green-600", bar: "bg-green-500", bg: "bg-green-50" };
    if (ratio > 0.2) return { text: "text-orange-500", bar: "bg-orange-400", bg: "bg-orange-50" };
    return { text: "text-red-500", bar: "bg-red-500", bg: "bg-red-50" };
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Parkings</h1>
            <p className="text-gray-500 text-sm mt-1">Disponibilité en temps réel</p>
          </div>
          <button
            onClick={fetchParkings}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading && Array.from({ length: 4 }).map((_, i) => <ParkingCardSkeleton key={i} />)}
          {!loading && parkings.map((parking) => {
            const colors = getAvailabilityColor(parking.availableSpaces, parking.totalSpaces);
            const pct = Math.round((parking.availableSpaces / parking.totalSpaces) * 100);

            return (
              <div key={parking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} shrink-0`}>
                    <Car className={colors.text} size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{parking.name}</h3>
                    <p className="text-sm text-gray-400">{parking.totalSpaces} places au total</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className={`text-4xl font-bold ${colors.text}`}>
                      {parking.availableSpaces}
                    </span>
                    <span className="text-sm text-gray-400">{pct}% libre</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  {parking.totalSpaces - parking.availableSpaces} places occupées
                </p>
              </div>
            );
          })}
        </div>

        {!loading && parkings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Aucun parking disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
}
