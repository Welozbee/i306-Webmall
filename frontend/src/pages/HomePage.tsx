import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../lib/api";
import ScratchCard from "../components/ScratchCard";
import Confetti from "../components/Confetti";
import WinBanner from "../components/WinBanner";
import { useInView } from "../hooks/useInView";
import { useCountUp } from "../hooks/useCountUp";
import { Store, Map, Car, Gift, ChevronRight, Users } from "lucide-react";

interface GameStatus {
  canPlay: boolean;
  attempt: number;
  hasPlayed: boolean;
  todaysPlays: { won: boolean; prize: string | null; attempt: number }[];
  prizesRemainingToday: number;
}

interface GameResult {
  won: boolean;
  prize: string | null;
  voucherCode: string | null;
  attempt: number;
  canPlayAgain: boolean;
  message: string;
}

interface Parking {
  id: number;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [monthlyVisitors, setMonthlyVisitors] = useState<number | null>(null);
  const [totalParking, setTotalParking] = useState<number | null>(null);
  const animatedVisitors = useCountUp(monthlyVisitors);
  const animatedParking = useCountUp(totalParking);

  useEffect(() => {
    if (user) {
      apiFetch<GameStatus>("/game/status").then(setGameStatus).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    apiFetch<{ count: number }>("/visitors/monthly")
      .then((d) => setMonthlyVisitors(d.count))
      .catch(() => {});
    apiFetch<Parking[]>("/parking")
      .then((parkings) => {
        const total = parkings.reduce((sum, p) => sum + p.availableSpaces, 0);
        setTotalParking(total);
      })
      .catch(() => {});
  }, []);

  const startGame = async () => {
    setLoading(true);
    try {
      const result = await apiFetch<GameResult>("/game/play", { method: "POST" });
      setGameResult(result);
      setPlaying(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleScratchComplete = () => {
    setRevealed(true);
    if (gameResult?.won) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    if (user) {
      apiFetch<GameStatus>("/game/status").then(setGameStatus).catch(() => {});
    }
  };

  const resetGame = () => {
    setPlaying(false);
    setRevealed(false);
    setGameResult(null);
  };

  const gameSection = useInView();
  const linksSection = useInView();

  return (
    <div className="min-h-screen">
      {showConfetti && <Confetti />}
      <WinBanner />
      {/* Hero with image */}
      <section className="relative">
        <div className="overflow-hidden h-[300px] md:h-[500px] bg-black">
          <img
            src="/images/accueil.jpg"
            alt="FoxTown Factory Stores"
            className="w-full h-full object-cover"
            style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <img src="/images/foxtown-icon.svg" alt="FoxTown" className="h-20 md:h-28 mb-3 drop-shadow-lg" />
          <p className="text-sm md:text-lg opacity-90 mt-1 drop-shadow px-4 text-center">
            Le paradis du shopping &middot; 160 boutiques &middot; 250 marques
          </p>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-10 flex justify-center gap-3 sm:gap-6 px-4">
          <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg border border-gray-100 px-3 py-3 sm:px-6 sm:py-4 shadow-lg">
            <Users className="text-fox-orange shrink-0" size={24} />
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {monthlyVisitors !== null ? animatedVisitors.toLocaleString("fr-CH") : "..."}
              </p>
              <p className="text-xs text-gray-500">Visiteurs ce mois</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg border border-gray-100 px-3 py-3 sm:px-6 sm:py-4 shadow-lg">
            <Car className="text-fox-orange shrink-0" size={24} />
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-1.5">
                {totalParking !== null ? animatedParking.toLocaleString("fr-CH") : "..."}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </p>
              <p className="text-xs text-gray-500">Places libres</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Section */}
      <section ref={gameSection.ref} className={`pt-14 sm:pt-16 pb-12 bg-fox-red/5 transition-all duration-700 ${gameSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <Gift className="inline-block text-fox-orange mb-2" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">Jeu du jour</h2>
            <p className="text-gray-600 mt-2">Grattez votre carte et tentez de gagner des bons d'achat !</p>
          </div>

          <div className="flex flex-col items-center">
            {!user ? (
              <div className="bg-white rounded-lg p-8 shadow text-center max-w-md">
                <p className="text-gray-600 mb-4">Connectez-vous pour participer au jeu quotidien !</p>
                <Link
                  to="/login"
                  className="inline-block bg-fox-orange text-white px-6 py-3 rounded-md font-medium hover:bg-orange-600 transition"
                >
                  Se connecter
                </Link>
              </div>
            ) : playing ? (
              <div className="flex flex-col items-center gap-4">
                <ScratchCard onComplete={handleScratchComplete} result={gameResult} />
                {gameResult && revealed && (
                  <div className="text-center mt-4">
                    <p className="text-gray-700">{gameResult.message}</p>
                    {gameResult.won && gameResult.voucherCode && (
                      <div className="mt-2">
                        <p className="font-mono text-sm bg-orange-50 inline-block px-4 py-2 rounded border border-orange-200">
                          Code : {gameResult.voucherCode}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          <Link to="/rewards" className="text-fox-orange hover:underline">Voir tous mes bons</Link>
                        </p>
                      </div>
                    )}
                    {gameResult.canPlayAgain && (
                      <button
                        onClick={resetGame}
                        className="mt-3 bg-fox-orange text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition"
                      >
                        Tenter ma 2ème chance !
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : gameStatus?.canPlay ? (
              <div className="bg-white rounded-lg p-8 shadow text-center max-w-md">
                <p className="text-gray-600 mb-2">
                  {gameStatus.attempt === 1
                    ? "Vous avez 1 tentative aujourd'hui !"
                    : "Deuxième chance ! Grattez pour découvrir votre lot."}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  {gameStatus.prizesRemainingToday} cadeaux encore disponibles aujourd'hui
                </p>
                <button
                  onClick={startGame}
                  disabled={loading}
                  className="bg-fox-orange text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {loading ? "Chargement..." : "Gratter ma carte !"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 shadow text-center max-w-md">
                {gameStatus?.todaysPlays.some((p) => p.won) ? (
                  <>
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-fox-orange font-bold text-lg">
                      Félicitations ! Vous avez gagné aujourd'hui :
                    </p>
                    <p className="text-gray-700 mt-1">
                      {gameStatus.todaysPlays.find((p) => p.won)?.prize}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">Vous avez déjà joué aujourd'hui.</p>
                    <p className="text-sm text-gray-400 mt-1">Revenez demain pour retenter votre chance !</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section ref={linksSection.ref} className={`py-12 transition-all duration-700 delay-100 ${linksSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/boutiques"
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition group border border-gray-100"
            >
              <Store className="text-fox-orange mb-3" size={32} />
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-fox-orange transition">
                Nos boutiques
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                Découvrez plus de 160 boutiques et 250 marques
              </p>
              <span className="text-fox-orange text-sm mt-3 inline-flex items-center gap-1">
                Voir les boutiques <ChevronRight size={14} />
              </span>
            </Link>

            <Link
              to="/plan"
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition group border border-gray-100"
            >
              <Map className="text-fox-orange mb-3" size={32} />
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-fox-orange transition">
                Plan du centre
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                4 niveaux à explorer, trouvez votre boutique
              </p>
              <span className="text-fox-orange text-sm mt-3 inline-flex items-center gap-1">
                Voir le plan <ChevronRight size={14} />
              </span>
            </Link>

            <Link
              to="/parkings"
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition group border border-gray-100"
            >
              <Car className="text-fox-orange mb-3" size={32} />
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-fox-orange transition">
                Parkings
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                Consultez les places disponibles en temps réel
              </p>
              <span className="text-fox-orange text-sm mt-3 inline-flex items-center gap-1">
                Voir les parkings <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
