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
  0: "bg-green-100 text-green-700",
  1: "bg-red-100 text-red-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-emerald-100 text-emerald-700",
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
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-100 rounded-lg w-40" />
          <div className="h-52 bg-gray-100 rounded-2xl" />
          <div className="h-4 bg-gray-100 rounded-lg w-32" />
          <div className="h-4 bg-gray-100 rounded-lg w-56" />
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Boutique introuvable.</p>
        <Link to="/boutiques" className="text-fox-orange hover:underline text-sm">
          Retour aux boutiques
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/boutiques"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Retour aux boutiques
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="h-16 w-16 object-contain rounded-xl bg-gray-50 p-2 border border-gray-100"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-orange-50 flex items-center justify-center text-fox-orange font-bold text-xl border border-orange-100">
                {shop.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${FLOOR_COLORS[shop.floor] || "bg-gray-100 text-gray-600"}`}
                >
                  <MapPin size={10} className="inline mr-1 -mt-px" />
                  Level {shop.floor}
                </span>
                {shop.category && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-fox-orange font-medium">
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
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={shop.name}
                  className="rounded-xl w-full h-44 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="px-6 py-6 space-y-3">
          {shop.openingHours && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={15} className="text-gray-400 shrink-0" />
              <span>{shop.openingHours}</span>
            </div>
          )}
          {shop.phone && (
            <a
              href={`tel:+41${shop.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-fox-orange transition-colors"
            >
              <Phone size={15} className="text-gray-400 shrink-0" />
              <span>+41 {shop.phone}</span>
            </a>
          )}
          {shop.url && (
            <a
              href={shop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-fox-orange hover:underline"
            >
              <ExternalLink size={15} />
              <span>Visiter le site officiel</span>
            </a>
          )}
        </div>
      </div>

      {/* Similar shops */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Boutiques similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similar.map((s) => (
              <Link
                key={s.id}
                to={`/boutiques/${s.id}`}
                className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center text-fox-orange font-semibold text-sm mb-2">
                  {s.name.charAt(0)}
                </div>
                <p className="font-medium text-gray-900 text-sm truncate group-hover:text-fox-orange transition-colors">
                  {s.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Level {s.floor}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
