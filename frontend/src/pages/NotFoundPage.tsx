import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-8xl font-bold text-gray-100 select-none">404</p>
        <div className="-mt-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
          <p className="text-gray-500 text-sm mb-8">
            Cette page n'existe pas ou a été déplacée.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeft size={15} />
              Retour
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-fox-orange rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              <Home size={15} />
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
