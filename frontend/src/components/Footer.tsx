export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/images/foxtown-icon.svg" alt="FoxTown" className="h-10 mb-2" />
            <p className="text-sm">Factory Stores</p>
            <p className="text-sm mt-1">Mendrisio, Switzerland</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Horaires</h4>
            <p className="text-sm">Ouvert 7 jours sur 7</p>
            <p className="text-sm">11h00 - 19h00</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <p className="text-sm">Tel: +41 848 828 888</p>
            <p className="text-sm">www.foxtown.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} FoxTown Factory Stores. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
