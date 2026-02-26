import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/foxtown-icon.svg" alt="FoxTown" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenue ! Connectez-vous à votre compte.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
                placeholder="Votre mot de passe"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fox-orange text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-fox-orange hover:underline font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
