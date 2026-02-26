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

      {/* Hero */}
      <section className="relative">
        <div className="overflow-hidden h-[320px] md:h-[520px] bg-black">
          <img
            src="/images/accueil.jpg"
            alt="FoxTown Factory Stores"
            className="w-full h-full object-cover opacity-90"
            style={{ transform: `translateY(${scrollY * 0.28}px) scale(1.12)` }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <img src="/images/foxtown-icon.svg" alt="FoxTown" className="h-16 md:h-24 mb-4 drop-shadow-lg" />
          <p className="text-sm md:text-base text-white/80 tracking-wide">
            Le paradis du shopping &nbsp;&middot;&nbsp; 160 boutiques &nbsp;&middot;&nbsp; 250 marques
          </p>
        </div>

        {/* Floating stat cards */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-10 flex justify-center gap-3 sm:gap-4 px-4">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 sm:px-6 sm:py-4 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 shrink-0">
              <Users className="text-fox-orange" size={20} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                {monthlyVisitors !== null ? animatedVisitors.toLocaleString("fr-CH") : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Visiteurs ce mois</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 sm:px-6 sm:py-4 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 shrink-0">
              <Car className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-none flex items-center gap-2">
                {totalParking !== null ? animatedParking.toLocaleString("fr-CH") : "—"}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Places libres</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game section */}
      <section
        ref={gameSection.ref}
        className={`pt-20 sm:pt-24 pb-16 bg-gray-50 transition-all duration-700 ${
          gameSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 mb-5">
            <Gift className="text-fox-orange" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Jeu du jour</h2>
          <p className="text-gray-500 mt-2 mb-10">
            Grattez votre carte et tentez de gagner des bons d'achat !
          </p>

          <div className="flex flex-col items-center">
            {!user ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Connectez-vous pour participer au jeu quotidien et tentez de gagner des bons d'achat exclusifs.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full bg-fox-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            ) : playing ? (
              <div className="flex flex-col items-center gap-5">
                <ScratchCard onComplete={handleScratchComplete} result={gameResult} />
                {gameResult && revealed && (
                  <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-sm w-full">
                    <p className="text-gray-700 text-sm">{gameResult.message}</p>
                    {gameResult.won && gameResult.voucherCode && (
                      <div className="mt-4">
                        <p className="font-mono text-sm bg-orange-50 text-fox-orange inline-block px-4 py-2 rounded-lg border border-orange-100">
                          {gameResult.voucherCode}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          <Link to="/rewards" className="text-fox-orange hover:underline">
                            Voir tous mes bons →
                          </Link>
                        </p>
                      </div>
                    )}
                    {gameResult.canPlayAgain && (
                      <button
                        onClick={resetGame}
                        className="mt-4 w-full bg-fox-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                      >
                        Tenter ma 2ème chance !
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : gameStatus?.canPlay ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
                <p className="text-gray-700 text-sm mb-1">
                  {gameStatus.attempt === 1
                    ? "Vous avez 1 tentative aujourd'hui !"
                    : "Deuxième chance ! Grattez pour découvrir votre lot."}
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  {gameStatus.prizesRemainingToday} cadeaux encore disponibles aujourd'hui
                </p>
                <button
                  onClick={startGame}
                  disabled={loading}
                  className="w-full bg-fox-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Chargement..." : "Gratter ma carte !"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
                {gameStatus?.todaysPlays.some((p) => p.won) ? (
                  <>
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-fox-orange font-semibold">
                      Félicitations ! Vous avez gagné aujourd'hui :
                    </p>
                    <p className="text-gray-700 text-sm mt-1">
                      {gameStatus.todaysPlays.find((p) => p.won)?.prize}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm">Vous avez déjà joué aujourd'hui.</p>
                    <p className="text-xs text-gray-400 mt-1">Revenez demain pour retenter votre chance !</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section
        ref={linksSection.ref}
        className={`py-16 transition-all duration-700 delay-100 ${
          linksSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Explorer FoxTown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                to: "/boutiques",
                icon: <Store className="text-fox-orange" size={24} />,
                bg: "bg-orange-50",
                title: "Nos boutiques",
                desc: "Découvrez plus de 160 boutiques et 250 marques prestigieuses",
                cta: "Voir les boutiques",
              },
              {
                to: "/plan",
                icon: <Map className="text-blue-500" size={24} />,
                bg: "bg-blue-50",
                title: "Plan du centre",
                desc: "4 niveaux à explorer — trouvez facilement votre boutique",
                cta: "Voir le plan",
              },
              {
                to: "/parkings",
                icon: <Car className="text-green-600" size={24} />,
                bg: "bg-green-50",
                title: "Parkings",
                desc: "Disponibilité en temps réel des places de parking",
                cta: "Voir les parkings",
              },
            ].map(({ to, icon, bg, title, desc, cta }) => (
              <Link
                key={to}
                to={to}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bg} mb-4`}>
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-fox-orange transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm text-fox-orange mt-4 font-medium">
                  {cta} <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
