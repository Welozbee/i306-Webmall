import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { Store, Car, BarChart3, Save, Plus, Trash2, Edit3, X, Users, Shield, Gift, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Shop {
  id: number;
  name: string;
  floor: number;
  category: string;
  storeNumber: string;
  phone: string;
  url: string;
  openingHours: string;
}

interface Parking {
  id: number;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
}

interface VisitorStats {
  today: number;
  thisMonth: number;
  thisYear: number;
  total: number;
  dailyBreakdown: { date: string; count: number }[];
}

interface UserItem {
  id: number;
  email: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
  createdAt: string;
}

interface Prize {
  id: number;
  name: string;
  description: string;
  shopName: string;
  quantity: number;
  claimed: number;
  active: boolean;
  createdAt: string;
}

type Tab = "shops" | "parkings" | "stats" | "users" | "prizes";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "shops", label: "Boutiques", icon: <Store size={15} /> },
  { id: "parkings", label: "Parkings", icon: <Car size={15} /> },
  { id: "stats", label: "Statistiques", icon: <BarChart3 size={15} /> },
];

export default function AdminPage() {
  const { user, isEmployee } = useAuth();
  const [tab, setTab] = useState<Tab>("shops");

  if (!user || !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  const allTabs = user.role === "ADMIN"
    ? [...TABS,
        { id: "users" as Tab, label: "Utilisateurs", icon: <Users size={15} /> },
        { id: "prizes" as Tab, label: "Lots", icon: <Gift size={15} /> },
      ]
    : TABS;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administration</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les boutiques, parkings et statistiques</p>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-1">
            {allTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? "border-fox-orange text-fox-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {tab === "shops" && <ShopsAdmin />}
        {tab === "parkings" && <ParkingsAdmin />}
        {tab === "stats" && <StatsAdmin />}
        {tab === "users" && <UsersAdmin currentUserId={user.id} />}
        {tab === "prizes" && <PrizesAdmin />}
      </div>
    </div>
  );
}

function ShopsAdmin() {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", floor: 0, category: "", storeNumber: "", phone: "", url: "", openingHours: "11:00-19:00",
  });

  useEffect(() => {
    apiFetch<Shop[]>("/shop").then(setShops).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiFetch(`/shop/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/shop", { method: "POST", body: JSON.stringify({ ...form, logoUrl: "" }) });
      }
      const updated = await apiFetch<Shop[]>("/shop");
      setShops(updated);
      toast(editingId ? "Boutique modifiée" : "Boutique créée");
      setEditingId(null);
      setShowCreate(false);
      setForm({ name: "", floor: 0, category: "", storeNumber: "", phone: "", url: "", openingHours: "11:00-19:00" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleEdit = (shop: Shop) => {
    setEditingId(shop.id);
    setForm({
      name: shop.name, floor: shop.floor, category: shop.category,
      storeNumber: shop.storeNumber, phone: shop.phone, url: shop.url, openingHours: shop.openingHours,
    });
    setShowCreate(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette boutique ?")) return;
    try {
      await apiFetch(`/shop/${id}`, { method: "DELETE" });
      setShops(shops.filter((s) => s.id !== id));
      toast("Boutique supprimée");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreate(false);
    setForm({ name: "", floor: 0, category: "", storeNumber: "", phone: "", url: "", openingHours: "11:00-19:00" });
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition";

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-400">{shops.length} boutiques</p>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="flex items-center gap-1.5 bg-fox-orange text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus size={15} />
          Ajouter
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-gray-900 text-sm">
              {editingId ? "Modifier la boutique" : "Nouvelle boutique"}
            </h3>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <input type="number" placeholder="Étage" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} className={inputClass} />
            <input placeholder="Catégorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
            <input placeholder="N° boutique" value={form.storeNumber} onChange={(e) => setForm({ ...form, storeNumber: e.target.value })} className={inputClass} />
            <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            <input placeholder="URL site web" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} />
            <input placeholder="Horaires" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className={`${inputClass} md:col-span-2`} />
          </div>
          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-1.5 bg-fox-orange text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Save size={14} />
            {editingId ? "Enregistrer" : "Créer"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Catégorie</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Étage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Téléphone</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{shop.storeNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{shop.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{shop.category}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">L{shop.floor}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{shop.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(shop)}
                      className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParkingsAdmin() {
  const { toast } = useToast();
  const [parkings, setParkings] = useState<Parking[]>([]);

  useEffect(() => {
    apiFetch<Parking[]>("/parking").then(setParkings).catch(() => {});
  }, []);

  const updateParking = async (id: number, availableSpaces: number) => {
    try {
      const updated = await apiFetch<Parking>(`/parking/${id}`, {
        method: "PUT",
        body: JSON.stringify({ availableSpaces }),
      });
      setParkings(parkings.map((p) => (p.id === id ? updated : p)));
      toast("Parking mis à jour");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {parkings.map((parking) => (
        <div key={parking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">{parking.name}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Places disponibles</label>
              <input
                type="number"
                min={0}
                max={parking.totalSpaces}
                value={parking.availableSpaces}
                onChange={(e) => {
                  const val = Math.min(Math.max(0, Number(e.target.value)), parking.totalSpaces);
                  setParkings(parkings.map((p) => (p.id === parking.id ? { ...p, availableSpaces: val } : p)));
                }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
              />
              <p className="text-xs text-gray-400 mt-1">Total: {parking.totalSpaces} places</p>
            </div>
            <button
              onClick={() => updateParking(parking.id, parking.availableSpaces)}
              className="flex items-center gap-1.5 bg-fox-orange text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Save size={13} />
              Enregistrer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const DAY_OPTIONS = [
  { label: "7 j", value: 7 },
  { label: "14 j", value: 14 },
  { label: "30 j", value: 30 },
];

function StatsAdmin() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    apiFetch<VisitorStats>("/visitors/stats").then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return <p className="text-gray-400 text-sm">Chargement des statistiques...</p>;
  }

  const allChartData = stats.dailyBreakdown.map((day) => ({
    date: new Date(day.date).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit" }),
    Visiteurs: day.count,
  }));

  const chartData = allChartData.slice(-days);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Aujourd'hui", value: stats.today },
          { label: "Ce mois", value: stats.thisMonth },
          { label: "Cette année", value: stats.thisYear },
          { label: "Total", value: stats.total },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-fox-orange">{value.toLocaleString("fr-CH")}</p>
            <p className="text-xs text-gray-400 mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 text-sm">Visiteurs</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  days === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune donnée disponible.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f68b1f" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#f68b1f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f3f4f6",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                  color: "#111827",
                }}
                cursor={{ stroke: "#f68b1f", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="Visiteurs"
                stroke="#f68b1f"
                strokeWidth={2}
                fill="url(#visitorGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#f68b1f", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function PrizesAdmin() {
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [showGenerate, setShowGenerate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", shopName: "", quantity: 10 });

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition";

  useEffect(() => {
    apiFetch<Prize[]>("/prizes").then(setPrizes).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiFetch(`/prizes/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/prizes", { method: "POST", body: JSON.stringify(form) });
      }
      const updated = await apiFetch<Prize[]>("/prizes");
      setPrizes(updated);
      toast(editingId ? "Lot modifié" : "Lot créé");
      cancelEdit();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleEdit = (prize: Prize) => {
    setEditingId(prize.id);
    setForm({ name: prize.name, description: prize.description, shopName: prize.shopName, quantity: prize.quantity });
    setShowCreate(true);
    setShowGenerate(false);
  };

  const handleToggleActive = async (prize: Prize) => {
    try {
      const updated = await apiFetch<Prize>(`/prizes/${prize.id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !prize.active }),
      });
      setPrizes(prizes.map((p) => (p.id === updated.id ? updated : p)));
      toast(updated.active ? "Lot activé" : "Lot désactivé");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce lot ?")) return;
    try {
      await apiFetch(`/prizes/${id}`, { method: "DELETE" });
      setPrizes(prizes.filter((p) => p.id !== id));
      toast("Lot supprimé");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleGenerate = async () => {
    try {
      await apiFetch("/prizes/generate", { method: "POST", body: JSON.stringify({ count: generateCount }) });
      const updated = await apiFetch<Prize[]>("/prizes");
      setPrizes(updated);
      toast(`${generateCount} lot(s) générés`);
      setShowGenerate(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreate(false);
    setForm({ name: "", description: "", shopName: "", quantity: 10 });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-400">{prizes.length} lots</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowGenerate(!showGenerate); setShowCreate(false); cancelEdit(); }}
            className="flex items-center gap-1.5 border border-fox-orange text-fox-orange px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            <Zap size={15} />
            Générer
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowGenerate(false); setEditingId(null); }}
            className="flex items-center gap-1.5 bg-fox-orange text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus size={15} />
            Ajouter
          </button>
        </div>
      </div>

      {showGenerate && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Générer des lots aléatoires</h3>
            <button onClick={() => setShowGenerate(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Les lots sont générés à partir des boutiques existantes avec des montants aléatoires (10–50 CHF) et une quantité de 10 chacun.</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Nombre :</label>
              <input
                type="number"
                min={1}
                max={20}
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 bg-fox-orange text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Zap size={14} />
              Générer
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-gray-900 text-sm">
              {editingId ? "Modifier le lot" : "Nouveau lot"}
            </h3>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Nom du lot" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} md:col-span-2`} />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} md:col-span-2`} />
            <input placeholder="Boutique" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className={inputClass} />
            <input type="number" placeholder="Quantité" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className={inputClass} />
          </div>
          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-1.5 bg-fox-orange text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Save size={14} />
            {editingId ? "Enregistrer" : "Créer"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lot</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Boutique</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {prizes.map((prize) => (
              <tr key={prize.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{prize.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{prize.description}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{prize.shopName}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-fox-orange rounded-full"
                        style={{ width: `${Math.min(100, (prize.claimed / prize.quantity) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{prize.claimed}/{prize.quantity}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                    prize.active ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {prize.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => handleToggleActive(prize)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        prize.active
                          ? "text-green-500 hover:text-green-700 hover:bg-green-50"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      title={prize.active ? "Désactiver" : "Activer"}
                    >
                      {prize.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(prize)}
                      className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {prizes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  Aucun lot configuré. Créez-en un ou générez-en aléatoirement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersAdmin({ currentUserId }: { currentUserId: number }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserItem[]>("/users")
      .then(setUsers)
      .catch(() => toast("Erreur lors du chargement des utilisateurs", "error"))
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (userId: number, newRole: UserItem["role"]) => {
    try {
      const updated = await apiFetch<UserItem>(`/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      toast("Rôle mis à jour");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const roleBadge = (role: UserItem["role"]) => {
    const styles = {
      ADMIN: "bg-red-50 text-red-700 border-red-100",
      EMPLOYEE: "bg-blue-50 text-blue-700 border-blue-100",
      USER: "bg-gray-100 text-gray-600 border-gray-200",
    };
    const labels = { ADMIN: "Admin", EMPLOYEE: "Employé", USER: "Utilisateur" };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[role]}`}>
        {role === "ADMIN" && <Shield size={11} />}
        {labels[role]}
      </span>
    );
  };

  if (loading) return <p className="text-gray-400 text-sm">Chargement des utilisateurs...</p>;

  return (
    <div>
      <p className="text-sm text-gray-400 mb-5">{users.length} utilisateurs</p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Inscrit le</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {new Date(u.createdAt).toLocaleDateString("fr-CH")}
                </td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3 text-center">
                  {u.id === currentUserId ? (
                    <span className="text-xs text-gray-400">Vous</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as UserItem["role"])}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
                    >
                      <option value="USER">Utilisateur</option>
                      <option value="EMPLOYEE">Employé</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
