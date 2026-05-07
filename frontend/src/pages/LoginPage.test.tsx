/**
 * Tests unitaires – LoginPage
 *
 * Outil  : Vitest + React Testing Library
 * Isolation : useAuth mocké, react-router-dom via MemoryRouter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    isEmployee: false,
  }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper : sélecteurs par placeholder (labels sans htmlFor dans le composant)
const sel = {
  email: () => screen.getByPlaceholderText(/votre@email.com/i),
  password: () => screen.getByPlaceholderText(/votre mot de passe/i),
};

// ─── U-AUTH-FE-01 : Rendu nominal ─────────────────────────────────────────────

describe("U-AUTH-FE-01 : rendu nominal", () => {
  it("affiche les champs email, mot de passe et le bouton de connexion", () => {
    // Arrange : page sans état particulier

    // Act : rendu de la page de connexion
    renderLoginPage();

    // Assert : éléments de formulaire présents
    expect(sel.email()).toBeInTheDocument();
    expect(sel.password()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });
});

// ─── U-AUTH-FE-02 : Connexion réussie ────────────────────────────────────────

describe("U-AUTH-FE-02 : connexion réussie", () => {
  it("appelle login puis redirige vers la page d'accueil", async () => {
    // Arrange : login réussit sans erreur
    mockLogin.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    renderLoginPage();

    // Act : remplir et soumettre le formulaire
    await user.type(sel.email(), "user@webmall.ch");
    await user.type(sel.password(), "Password123!");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    // Assert : login appelé avec les bons arguments et redirection effectuée
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@webmall.ch", "Password123!");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});

// ─── U-AUTH-FE-03 : Identifiants incorrects ──────────────────────────────────

describe("U-AUTH-FE-03 : identifiants incorrects", () => {
  it("affiche un message d'erreur et ne redirige pas", async () => {
    // Arrange : login rejette avec un message d'erreur
    mockLogin.mockRejectedValueOnce(new Error("Identifiants incorrects"));

    const user = userEvent.setup();
    renderLoginPage();

    // Act : soumettre avec de mauvais identifiants
    await user.type(sel.email(), "bad@webmall.ch");
    await user.type(sel.password(), "wrongpass");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    // Assert : erreur affichée, pas de redirection
    await waitFor(() => {
      expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// ─── U-AUTH-FE-04 : Champs vides ─────────────────────────────────────────────

describe("U-AUTH-FE-04 : champs vides", () => {
  it("le bouton submit est de type submit — le navigateur bloque la soumission si champs vides", () => {
    // Arrange : formulaire vide

    // Act : rendu
    renderLoginPage();

    // Assert : les inputs sont marqués required (validation HTML5)
    expect(sel.email()).toBeRequired();
    expect(sel.password()).toBeRequired();
  });
});

// ─── U-AUTH-FE-05 : Lien vers inscription ────────────────────────────────────

describe("U-AUTH-FE-05 : lien vers la page d'inscription", () => {
  it("contient un lien pointant vers /register", () => {
    // Arrange : pas de pré-condition

    // Act : rendu
    renderLoginPage();

    // Assert : lien d'inscription présent
    const link = screen.getByRole("link", { name: /créer un compte/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/register");
  });
});

// ─── U-AUTH-FE-06 : État de chargement ───────────────────────────────────────

describe("U-AUTH-FE-06 : état de chargement", () => {
  it("désactive le bouton pendant l'appel API", async () => {
    // Arrange : login prend du temps (promesse suspendue)
    let resolveLogin!: () => void;
    mockLogin.mockReturnValueOnce(
      new Promise<void>((resolve) => { resolveLogin = resolve; }),
    );

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(sel.email(), "u@webmall.ch");
    await user.type(sel.password(), "pass1234");

    // Act : soumettre le formulaire
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    // Assert : bouton désactivé pendant le chargement
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /connexion/i })).toBeDisabled();
    });

    // Cleanup : résoudre la promesse pour éviter les fuites d'état
    resolveLogin();
  });
});

// ─── U-AUTH-FE-07 : Erreur réseau ────────────────────────────────────────────

describe("U-AUTH-FE-07 : erreur réseau (500)", () => {
  it("affiche un message générique sans crash si le serveur répond 500", async () => {
    // Arrange : login lève une erreur générique (serveur indisponible)
    mockLogin.mockRejectedValueOnce(new Error("HTTP 500"));

    const user = userEvent.setup();
    renderLoginPage();

    // Act : soumettre le formulaire
    await user.type(sel.email(), "u@webmall.ch");
    await user.type(sel.password(), "pass1234");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    // Assert : message d'erreur affiché, la page ne crashe pas
    await waitFor(() => {
      expect(screen.getByText(/http 500/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });
});
