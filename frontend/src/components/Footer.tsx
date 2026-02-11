import OpeningStatus from "./OpeningStatus";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/images/foxtown-icon.svg" alt="FoxTown" className="h-10 mb-2" />
            <p className="text-sm">Factory Stores</p>
            <p className="text-sm mt-1">Mendrisio, Switzerland</p>
            <a
              href="https://www.google.com/maps/place/FoxTown+Factory+Stores/@45.874896,8.9796461,701m/data=!3m3!1e3!4b1!5s0x478429c9d9e18945:0x7edf0a3ad7f289dc!4m6!3m5!1s0x478429b629ef470b:0x2080d4bd45803bf!8m2!3d45.874896!4d8.9796461!16s%2Fg%2F1ts_5g7c?entry=ttu&g_ep=EgoyMDI2MDIwOS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-fox-orange hover:underline mt-2"
            >
              <MapPin size={14} />
              Voir sur Google Maps
            </a>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Horaires</h4>
            <p className="text-sm">Ouvert 7 jours sur 7</p>
            <p className="text-sm">11h00 - 19h00</p>
            <div className="mt-2">
              <OpeningStatus />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <p className="text-sm">Tel: +41 848 828 888</p>
            <p className="text-sm">www.foxtown.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-500">
          Made with 🍺 & ❤️ by Daniel, Mathieu, Chris & Keito
        </div>
      </div>
    </footer>
  );
}
