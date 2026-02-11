import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { Car, RefreshCw } from "lucide-react";

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

  const getOccupancyColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return "text-green-600";
    if (ratio > 0.2) return "text-orange-500";
    return "text-red-600";
  };

  const getBarColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return "bg-green-500";
    if (ratio > 0.2) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Parkings</h1>
        <button
          onClick={fetchParkings}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-fox-orange hover:text-orange-600 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parkings.map((parking) => (
          <div key={parking.id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-fox-orange/10 p-3 rounded-lg">
                <Car className="text-fox-orange" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{parking.name}</h3>
                <p className="text-sm text-gray-500">{parking.totalSpaces} places au total</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-end justify-between mb-1">
                <span className={`text-3xl font-bold ${getOccupancyColor(parking.availableSpaces, parking.totalSpaces)}`}>
                  {parking.availableSpaces}
                </span>
                <span className="text-sm text-gray-500">places disponibles</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getBarColor(parking.availableSpaces, parking.totalSpaces)}`}
                  style={{ width: `${(parking.availableSpaces / parking.totalSpaces) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">
              {parking.totalSpaces - parking.availableSpaces} places occupées
            </p>
          </div>
        ))}
      </div>

      {parkings.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          Aucun parking disponible.
        </div>
      )}
    </div>
  );
}
