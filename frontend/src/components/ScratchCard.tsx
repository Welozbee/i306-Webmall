import { useState, useRef, useEffect, useCallback } from "react";

interface ScratchCardProps {
  width?: number;
  height?: number;
  onComplete: () => void;
  result: { won: boolean; prize?: string | null; voucherCode?: string | null; message: string } | null;
}

export default function ScratchCard({ width = 300, height = 200, onComplete, result }: ScratchCardProps) {
  // Mécanique principale du jeu: l'utilisateur "gratte" pour révéler le résultat.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const percentRef = useRef(0);

  const initCanvas = useCallback(() => {
    // Prépare la couche à gratter (overlay) au-dessus du résultat.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f68b1f");
    gradient.addColorStop(0.5, "#c32d39");
    gradient.addColorStop(1, "#f68b1f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "14px Inter, sans-serif";
    ctx.textAlign = "center";
    for (let y = 30; y < height; y += 40) {
      for (let x = 40; x < width; x += 100) {
        ctx.fillText("FOXTOWN", x, y);
      }
    }

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Grattez ici !", width / 2, height / 2 + 6);
  }, [width, height]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const scratch = (x: number, y: number) => {
    // Efface localement la couche de grattage et mesure la progression de révélation.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, width, height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    percentRef.current = (transparent / (width * height)) * 100;

    if (percentRef.current > 50 && !revealed) {
      setRevealed(true);
      ctx.clearRect(0, 0, width, height);
      onComplete();
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    // Uniformise les coordonnées souris/touch pour desktop et mobile.
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Démarre une session de grattage dès le premier contact.
    setIsScratching(true);
    const { x, y } = getPos(e);
    scratch(x, y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Continue l'effacement tant que l'utilisateur maintient le contact.
    if (!isScratching) return;
    const { x, y } = getPos(e);
    scratch(x, y);
  };

  const handleEnd = () => {
    // Termine proprement la phase de grattage.
    setIsScratching(false);
  };

  return (
    <div className="relative inline-block rounded-lg overflow-hidden shadow-lg border-2 border-fox-orange" style={{ width, height }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
        {revealed && result ? (
          result.won ? (
            <>
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-fox-orange font-bold text-lg text-center">Gagné !</p>
              <p className="text-sm text-gray-700 text-center mt-1">{result.prize}</p>
              {result.voucherCode && (
                <p className="mt-2 font-mono text-xs bg-orange-50 px-3 py-1 rounded border border-orange-200">
                  Code : {result.voucherCode}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">😔</div>
              <p className="text-gray-600 font-semibold text-center">Pas de chance !</p>
            </>
          )
        ) : (
          <p className="text-gray-300 text-lg font-semibold">?</p>
        )}
      </div>

      {!revealed && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 cursor-pointer"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      )}
    </div>
  );
}
