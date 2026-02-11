import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { Store, Car, BarChart3, Save, Plus, Trash2, Edit3, X, Users, Shield } from "lucide-react";

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

type Tab = "shops" | "parkings" | "stats" | "users";

export default function AdminPage() {
  const { user, isEmployee } = useAuth();
  const [tab, setTab] = useState<Tab>("shops");

  if (!user || !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Administration</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("shops")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
            tab === "shops" ? "border-fox-orange text-fox-orange" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Store size={16} />
          Boutiques
        </button>
        <button
          onClick={() => setTab("parkings")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
            tab === "parkings" ? "border-fox-orange text-fox-orange" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Car size={16} />
          Parkings
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
            tab === "stats" ? "border-fox-orange text-fox-orange" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart3 size={16} />
          Statistiques
        </button>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              tab === "users" ? "border-fox-orange text-fox-orange" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={16} />
            Utilisateurs
          </button>
        )}
      </div>

      {tab === "shops" && <ShopsAdmin />}
      {tab === "parkings" && <ParkingsAdmin />}
      {tab === "stats" && <StatsAdmin />}
      {tab === "users" && <UsersAdmin currentUserId={user.id} />}
    </div>
  );
}

function ShopsAdmin() {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", floor: 0, category: "", storeNumber: "", phone: "", url: "", openingHours: "11:00-19:00" });

  useEffect(() => {
    apiFetch<Shop[]>("/shop").then(setShops).catch(() => {});
  }, []);

  const handleSave = async () => {
    // Crée ou met à jour une boutique selon le mode en cours.
    try {
      if (editingId) {
        await apiFetch(`/shop/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/shop", {
          method: "POST",
          body: JSON.stringify({ ...form, logoUrl: "" }),
        });
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
      name: shop.name,
      floor: shop.floor,
      category: shop.category,
      storeNumber: shop.storeNumber,
      phone: shop.phone,
      url: shop.url,
      openingHours: shop.openingHours,
    });
    setShowCreate(true);
  };

  const handleDelete = async (id: number) => {
    // Supprime une boutique après confirmation opérateur.
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{shops.length} boutiques</p>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="flex items-center gap-1 bg-fox-orange text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {showCreate && (
        <div className="bg-orange-50 rounded-lg p-6 mb-6 border border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              {editingId ? "Modifier la boutique" : "Nouvelle boutique"}
            </h3>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <input
              type="number"
              placeholder="Étage"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <input
              placeholder="Catégorie"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <input
              placeholder="N° boutique"
              value={form.storeNumber}
              onChange={(e) => setForm({ ...form, storeNumber: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <input
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <input
              placeholder="URL site web"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <input
              placeholder="Horaires"
              value={form.openingHours}
              onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-1 bg-fox-orange text-white px-6 py-2 rounded-md text-sm hover:bg-orange-600 transition"
          >
            <Save size={16} />
            {editingId ? "Enregistrer" : "Créer"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Étage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Téléphone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{shop.storeNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{shop.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{shop.category}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">Level {shop.floor}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{shop.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(shop)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
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
    // Persiste la nouvelle disponibilité remontée par l'équipe terrain.
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {parkings.map((parking) => (
        <div key={parking.id} className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 text-lg mb-4">{parking.name}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Places disponibles</label>
              <input
                type="number"
                min={0}
                max={parking.totalSpaces}
                value={parking.availableSpaces}
                onChange={(e) => {
                  const val = Math.min(Math.max(0, Number(e.target.value)), parking.totalSpaces);
                  setParkings(parkings.map((p) => (p.id === parking.id ? { ...p, availableSpaces: val } : p)));
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
              />
            </div>
            <p className="text-xs text-gray-400">Total: {parking.totalSpaces} places</p>
            <button
              onClick={() => updateParking(parking.id, parking.availableSpaces)}
              className="flex items-center gap-1 bg-fox-orange text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition"
            >
              <Save size={14} />
              Enregistrer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsAdmin() {
  const [stats, setStats] = useState<VisitorStats | null>(null);

  useEffect(() => {
    apiFetch<VisitorStats>("/visitors/stats").then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return <p className="text-gray-400">Chargement des statistiques...</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Aujourd'hui" value={stats.today} />
        <StatCard label="Ce mois" value={stats.thisMonth} />
        <StatCard label="Cette année" value={stats.thisYear} />
        <StatCard label="Total" value={stats.total} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-4">30 derniers jours</h3>
        <div className="space-y-2">
          {stats.dailyBreakdown.map((day) => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-28">{new Date(day.date).toLocaleDateString("fr-CH")}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5">
                <div
                  className="bg-fox-orange h-5 rounded-full text-xs text-white flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.min(100, (day.count / Math.max(...stats.dailyBreakdown.map((d) => d.count), 1)) * 100)}%`,
                    minWidth: day.count > 0 ? "2rem" : "0",
                  }}
                >
                  {day.count}
                </div>
              </div>
            </div>
          ))}
        </div>
        {stats.dailyBreakdown.length === 0 && (
          <p className="text-gray-400 text-sm">Aucune donnée disponible.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 text-center">
      <p className="text-3xl font-bold text-fox-orange">{value.toLocaleString("fr-CH")}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function UsersAdmin({ currentUserId }: { currentUserId: number }) {
  // Administration des rôles pour contrôler les permissions de l'application.
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
    // Applique un nouveau rôle utilisateur avec retour immédiat dans la liste.
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
      ADMIN: "bg-red-100 text-red-700",
      EMPLOYEE: "bg-blue-100 text-blue-700",
      USER: "bg-gray-100 text-gray-600",
    };
    const labels = { ADMIN: "Admin", EMPLOYEE: "Employé", USER: "Utilisateur" };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {role === "ADMIN" && <Shield size={12} />}
        {labels[role]}
      </span>
    );
  };

  if (loading) return <p className="text-gray-400">Chargement des utilisateurs...</p>;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{users.length} utilisateurs</p>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Inscrit le</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {new Date(u.createdAt).toLocaleDateString("fr-CH")}
                </td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3">
                  {u.id === currentUserId ? (
                    <span className="text-xs text-gray-400">Vous</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as UserItem["role"])}
                      className="text-sm border border-gray-200 rounded-md px-2 py-1"
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
