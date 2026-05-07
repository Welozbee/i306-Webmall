/**
 * Tests unitaires – AuthContext
 *
 * Outil  : Vitest + React Testing Library
 * Isolation : fetch stubé, localStorage réel (jsdom)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Construit un JWT lisible par atob (payload en base64 standard) */
function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesig`;
}

function mockFetchResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

/** Composant de test consommant le contexte */
function AuthConsumer() {
  const { user, isEmployee, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="email">{user?.email ?? "null"}</span>
      <span data-testid="role">{user?.role ?? "null"}</span>
      <span data-testid="employee">{isEmployee ? "true" : "false"}</span>
      <button onClick={() => login("u@webmall.ch", "pass")}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── U-AUTH-FE-13 : État initial ──────────────────────────────────────────────

describe("U-AUTH-FE-13 : état initial sans token", () => {
  it("user est null et isEmployee est false si aucun token en localStorage", () => {
    // Arrange : localStorage vide (pas de session)

    // Act : rendu du provider
    renderWithAuth();

    // Assert : aucun utilisateur connecté
    expect(screen.getByTestId("email").textContent).toBe("null");
    expect(screen.getByTestId("employee").textContent).toBe("false");
  });
});

// ─── U-AUTH-FE-14 : Après login ───────────────────────────────────────────────

describe("U-AUTH-FE-14 : après login", () => {
  it("user est renseigné et tokens stockés en localStorage après une connexion réussie", async () => {
    // Arrange : réponse API de login réussie
    const fakeUser = { id: 1, email: "u@webmall.ch", role: "USER" as const };
    vi.mocked(fetch).mockResolvedValueOnce(
      mockFetchResponse(200, {
        accessToken: makeToken({ sub: "1", email: fakeUser.email, role: fakeUser.role, exp: Math.floor(Date.now() / 1000) + 3600 }),
        refreshToken: "rt",
        user: fakeUser,
      }),
    );

    const user = userEvent.setup();
    renderWithAuth();

    // Act : cliquer sur le bouton login (appelle login("u@webmall.ch", "pass"))
    await user.click(screen.getByRole("button", { name: "login" }));

    // Assert : l'utilisateur est maintenant dans le contexte
    expect(screen.getByTestId("email").textContent).toBe("u@webmall.ch");
    expect(localStorage.getItem("accessToken")).toBeTruthy();
    expect(localStorage.getItem("refreshToken")).toBe("rt");
  });
});

// ─── U-AUTH-FE-15 : Après logout ──────────────────────────────────────────────

describe("U-AUTH-FE-15 : après logout", () => {
  it("user revient à null et tokens supprimés du localStorage", async () => {
    // Arrange : session active — token valide dans localStorage
    const token = makeToken({
      sub: "1",
      email: "u@webmall.ch",
      role: "USER",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", "rt");

    // Arrange : la requête de logout (POST /auth/logout) réussit
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse(200, { message: "ok" }));

    const user = userEvent.setup();
    renderWithAuth();

    // Assert – l'utilisateur est bien connecté au départ
    expect(screen.getByTestId("email").textContent).toBe("u@webmall.ch");

    // Act : déconnexion
    await user.click(screen.getByRole("button", { name: "logout" }));

    // Assert : user repassé à null, tokens effacés
    expect(screen.getByTestId("email").textContent).toBe("null");
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});

// ─── U-AUTH-FE-16 : Persistance de session ────────────────────────────────────

describe("U-AUTH-FE-16 : persistance de session au rechargement", () => {
  it("restaure l'utilisateur depuis le token localStorage si non expiré", () => {
    // Arrange : token valide présent avant le rendu (simule un rechargement)
    const token = makeToken({
      sub: "42",
      email: "persist@webmall.ch",
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem("accessToken", token);

    // Act : le provider lit localStorage lors de l'initialisation
    renderWithAuth();

    // Assert : session restaurée sans appel réseau
    expect(screen.getByTestId("email").textContent).toBe("persist@webmall.ch");
    expect(screen.getByTestId("role").textContent).toBe("ADMIN");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});
