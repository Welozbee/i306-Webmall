const LEVELS = [
  { id: 0, name: "Level 0", color: "bg-green-500", description: "Freddy, Le Creuset, Bally Temporary" },
  { id: 1, name: "Level 1", color: "bg-red-500", description: "Nike, Swarovski, Polo Ralph Lauren, Philipp Plein..." },
  { id: 2, name: "Level 2", color: "bg-blue-500", description: "Calvin Klein, Tommy Hilfiger, Coach, Michael Kors..." },
  { id: 3, name: "Level 3", color: "bg-green-600", description: "Prada, Versace, Burberry, Dolce & Gabbana..." },
];

export default function PlanPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Plan du Centre</h1>

      {/* Plan display */}
      <div className="bg-white rounded-xl shadow p-4 overflow-auto mb-8">
        <div className="text-center">
          <img
            src="/images/plan-1.png"
            alt="Plan du centre FoxTown"
            className="max-w-full h-auto mx-auto"
          />
        </div>
      </div>

      {/* Directory image */}
      <div className="bg-white rounded-xl shadow p-4 overflow-auto mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Répertoire des boutiques</h2>
        <div className="text-center">
          <img
            src="/images/plan-2.png"
            alt="Répertoire des boutiques FoxTown"
            className="max-w-full h-auto mx-auto"
          />
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Légende des niveaux</h3>
          <div className="space-y-3">
            {LEVELS.map((level) => (
              <div key={level.id} className="flex items-start gap-3">
                <span className={`w-4 h-4 rounded mt-0.5 shrink-0 ${level.color}`} />
                <div>
                  <span className="text-sm font-medium text-gray-700">{level.name}</span>
                  <p className="text-xs text-gray-400">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Informations</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>160 boutiques sur 4 niveaux</li>
            <li>250 marques prestigieuses</li>
            <li>Réductions de 30% à 70% toute l'année</li>
            <li>9 bars et restaurants</li>
            <li>WiFi gratuit dans toutes les zones communes</li>
            <li>The Sense Gallery - Expérience multisensorielle</li>
            <li>Casino Admiral Mendrisio</li>
            <li>Ouvert 7j/7 de 11h à 19h</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
