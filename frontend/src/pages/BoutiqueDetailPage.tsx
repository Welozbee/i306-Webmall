import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ArrowLeft, Phone, ExternalLink, MapPin, Clock } from "lucide-react";

interface Shop {
  id: number;
  name: string;
  floor: number;
  category: string;
  storeNumber: string;
  phone: string;
  url: string;
  openingHours: string;
  logoUrl: string;
}

interface ShopImage {
  id: number;
  imageUrl: string;
}

const FLOOR_COLORS: Record<number, string> = {
  0: "bg-green-100 text-green-800",
  1: "bg-red-100 text-red-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-green-100 text-green-800",
};

export default function BoutiqueDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [images, setImages] = useState<ShopImage[]>([]);
  const [similar, setSimilar] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<Shop>(`/shop/${id}`),
      apiFetch<ShopImage[]>(`/shop/${id}/images`).catch(() => []),
      apiFetch<Shop[]>("/shop").catch(() => []),
    ])
      .then(([shopData, imagesData, allShops]) => {
        setShop(shopData);
        setImages(imagesData);
        setSimilar(
          allShops
            .filter((s) => s.category === shopData.category && s.id !== shopData.id)
            .slice(0, 4)
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Boutique introuvable.</p>
        <Link to="/boutiques" className="text-fox-orange hover:underline">
          Retour aux boutiques
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/boutiques" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-fox-orange transition mb-6">
        <ArrowLeft size={16} />
        Retour aux boutiques
      </Link>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-fox-orange/5 px-6 py-8">
          <div className="flex items-center gap-4">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="h-16 w-16 object-contain rounded-md bg-white p-2 border border-gray-100" />
            ) : (
              <div className="h-16 w-16 rounded-md bg-fox-orange/10 flex items-center justify-center text-fox-orange font-bold text-xl">
                {shop.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full ${FLOOR_COLORS[shop.floor] || "bg-gray-100 text-gray-600"}`}>
                  <MapPin size={10} className="inline mr-1" />
                  Level {shop.floor}
                </span>
                {shop.category && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-fox-orange">
                    {shop.category}
                  </span>
                )}
                {shop.storeNumber && (
                  <span className="text-xs text-gray-400 font-mono">#{shop.storeNumber}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="px-6 pt-6">
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => (
                <img key={img.id} src={img.imageUrl} alt={shop.name} className="rounded-md w-full h-40 object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="px-6 py-6 space-y-4">
          {shop.openingHours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-gray-400" />
              <span>{shop.openingHours}</span>
            </div>
          )}
          {shop.phone && (
            <a href={`tel:+41${shop.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-fox-orange transition">
              <Phone size={16} className="text-gray-400" />
              <span>+41 {shop.phone}</span>
            </a>
          )}
          {shop.url && (
            <a href={shop.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-fox-orange hover:underline">
              <ExternalLink size={16} />
              <span>Visiter le site officiel</span>
            </a>
          )}
        </div>
      </div>

      {/* Similar shops */}
      {similar.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Boutiques similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similar.map((s) => (
              <Link
                key={s.id}
                to={`/boutiques/${s.id}`}
                className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200 block"
              >
                <div className="h-10 w-10 rounded-md bg-fox-orange/10 flex items-center justify-center text-fox-orange font-bold text-sm mb-2">
                  {s.name.charAt(0)}
                </div>
                <p className="font-medium text-gray-800 text-sm truncate">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Level {s.floor}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
