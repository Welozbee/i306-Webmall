import OpeningStatus from "./OpeningStatus";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/images/foxtown-icon.svg" alt="FoxTown" className="h-9 mb-3" />
            <p className="text-sm text-gray-500">Factory Stores</p>
            <p className="text-sm text-gray-500">Mendrisio, Switzerland</p>
            <a
              href="https://www.google.com/maps/place/FoxTown+Factory+Stores/@45.874896,8.9796461,701m/data=!3m3!1e3!4b1!5s0x478429c9d9e18945:0x7edf0a3ad7f289dc!4m6!3m5!1s0x478429b629ef470b:0x2080d4bd45803bf!8m2!3d45.874896!4d8.9796461!16s%2Fg%2F1ts_5g7c?entry=ttu&g_ep=EgoyMDI2MDIwOS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-fox-orange hover:underline mt-3"
            >
              <MapPin size={13} />
              Voir sur Google Maps
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Horaires</h4>
            <p className="text-sm text-gray-500">Ouvert 7 jours sur 7</p>
            <p className="text-sm text-gray-500">11h00 – 19h00</p>
            <div className="mt-3">
              <OpeningStatus />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact</h4>
            <p className="text-sm text-gray-500">+41 848 828 888</p>
            <p className="text-sm text-gray-500">www.foxtown.com</p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-400">
          Made with 🍺 & ❤️ by Daniel, Mathieu, Chris & Keito
        </div>
      </div>
    </footer>
  );
}
