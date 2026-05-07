/**
 * Tests unitaires – WinBanner
 *
 * Outil  : Vitest + React Testing Library
 * Isolation : EventSource mocké globalement dans setup.ts
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import WinBanner from "./WinBanner";

// ─── U-GAME-FE-12 : Rendu avec message de gain ────────────────────────────────

describe("U-GAME-FE-12 : affichage d'un gain temps réel via SSE", () => {
  it("affiche la bannière avec le message reçu sur l'événement SSE 'win'", async () => {
    // Arrange : capturer le handler SSE enregistré par WinBanner
    const addListenerMock = vi.fn();
    vi.mocked(global.EventSource).mockImplementationOnce(function MockEventSource() {
      return {
        addEventListener: addListenerMock,
        removeEventListener: vi.fn(),
        close: vi.fn(),
      } as unknown as EventSource;
    } as unknown as typeof EventSource);

    render(<WinBanner />);

    // Arrange : récupérer le handler "win" enregistré lors du montage
    const winHandler = addListenerMock.mock.calls.find(
      ([eventType]) => eventType === "win",
    )?.[1] as ((e: { data: string }) => void) | undefined;
    expect(winHandler).toBeDefined();

    // Act : simuler un événement SSE "win" avec un payload valide
    act(() => {
      winHandler!({
        data: JSON.stringify({
          id: "evt-1",
          message: "Marie vient de gagner un bon Migros 50 CHF !",
          prize: "Bon Migros 50 CHF",
          wonAt: new Date().toISOString(),
        }),
      });
    });

    // Assert : la bannière affiche le message
    expect(
      await screen.findByText(/marie vient de gagner/i),
    ).toBeInTheDocument();
  });
});

// ─── U-GAME-FE-13 : Absence de bannière sans événement ───────────────────────

describe("U-GAME-FE-13 : aucune bannière sans événement SSE", () => {
  it("ne rend rien si aucun événement win n'a été reçu", () => {
    // Arrange : EventSource connecté mais silencieux

    // Act : rendu sans déclencher d'événement
    render(<WinBanner />);

    // Assert : aucune bannière visible dans le DOM
    expect(screen.queryByText(/vient de gagner/i)).not.toBeInTheDocument();
  });
});
