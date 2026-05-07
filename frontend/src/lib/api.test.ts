/**
 * Tests unitaires – api.ts (gestion du refresh token)
 *
 * Outil  : Vitest
 * Isolation : fetch est stubé globalement ; localStorage est réel (jsdom)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "./api";

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Construit une réponse fetch simulée */
function mockFetchResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

// ─── U-AUTH-FE-17 : Requête avec token valide ─────────────────────────────────

describe("U-AUTH-FE-17 : requête avec token valide", () => {
  it("transmet le token dans le header et retourne la réponse", async () => {
    // Arrange : token en localStorage et réponse API 200
    localStorage.setItem("accessToken", "valid-token");
    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse(200, { data: "ok" }),
    );

    // Act : appeler apiFetch
    const result = await apiFetch<{ data: string }>("/test");

    // Assert : réponse reçue et Authorization header transmis
    expect(result).toEqual({ data: "ok" });
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer valid-token",
    );
  });
});

// ─── U-AUTH-FE-18 : Requête avec token expiré → refresh automatique ──────────

describe("U-AUTH-FE-18 : token expiré → refresh automatique → requête rejouée", () => {
  it("rafraîchit le token puis rejoue la requête initiale avec succès", async () => {
    // Arrange : access token périmé, refresh token valide
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "valid-refresh-token");

    const fetchMock = vi.mocked(fetch);
    // Première requête → 401 (token périmé)
    fetchMock.mockResolvedValueOnce(mockFetchResponse(401, { error: "Unauthorized" }));
    // Appel de refresh → succès avec nouveau token
    fetchMock.mockResolvedValueOnce(
      mockFetchResponse(200, {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      }),
    );
    // Deuxième tentative avec le nouveau token → 200
    fetchMock.mockResolvedValueOnce(mockFetchResponse(200, { data: "refreshed" }));

    // Act : apiFetch gère le 401 de façon transparente
    const result = await apiFetch<{ data: string }>("/protected");

    // Assert : le résultat final est celui de la deuxième tentative
    expect(result).toEqual({ data: "refreshed" });
    // Assert : le nouveau token est stocké
    expect(localStorage.getItem("accessToken")).toBe("new-access-token");
    expect(localStorage.getItem("refreshToken")).toBe("new-refresh-token");
    // Assert : trois appels fetch au total (original + refresh + retry)
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

// ─── U-AUTH-FE-19 : Refresh échoué → déconnexion automatique ─────────────────

describe("U-AUTH-FE-19 : refresh échoué → déconnexion et erreur levée", () => {
  it("vide le localStorage et lève 'Session expired' si le refresh échoue", async () => {
    // Arrange : tokens en localStorage, refresh non disponible côté serveur
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "invalid-refresh");

    const fetchMock = vi.mocked(fetch);
    // Première requête → 401
    fetchMock.mockResolvedValueOnce(mockFetchResponse(401, { error: "Unauthorized" }));
    // Refresh → 401 également (session entièrement invalide)
    fetchMock.mockResolvedValueOnce(mockFetchResponse(401, { error: "Invalid refresh" }));

    // Act + Assert : l'erreur est propagée
    await expect(apiFetch("/protected")).rejects.toThrow("Session expired");

    // Assert : tokens supprimés du stockage
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});
