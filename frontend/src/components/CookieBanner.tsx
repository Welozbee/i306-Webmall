import { useState } from "react";

const STORAGE_KEY = "foxtown_cookies_accepted";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white border-t border-gray-200 shadow-lg px-4 py-4 md:px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-gray-600 flex-1">
          Ce site utilise des cookies pour améliorer votre expérience et analyser le trafic.
          En continuant votre navigation, vous acceptez l'utilisation de cookies.
        </p>
        <button
          onClick={accept}
          className="bg-fox-orange text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition shrink-0"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
