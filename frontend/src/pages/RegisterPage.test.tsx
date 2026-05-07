/**
 * Tests unitaires – RegisterPage
 *
 * Outil  : Vitest + React Testing Library
 * Isolation : useAuth mocké, react-router-dom via MemoryRouter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage";

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: mockRegister,
    isEmployee: false,
  }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

// Sélecteurs par placeholder (labels sans htmlFor dans le composant)
const sel = {
  email: () => screen.getByPlaceholderText(/votre@email.com/i),
  password: () => screen.getByPlaceholderText(/minimum 8 caractères/i),
  confirm: () => screen.getByPlaceholderText(/retapez votre mot de passe/i),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── U-AUTH-FE-08 : Rendu nominal ─────────────────────────────────────────────

describe("U-AUTH-FE-08 : rendu nominal", () => {
  it("affiche les champs email, mot de passe, confirmation et le bouton", () => {
    // Arrange : page sans état particulier

    // Act : rendu de la page d'inscription
    renderRegisterPage();

    // Assert : formulaire complet présent
    expect(sel.email()).toBeInTheDocument();
    expect(sel.password()).toBeInTheDocument();
    expect(sel.confirm()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /créer mon compte/i })).toBeInTheDocument();
  });
});

// ─── U-AUTH-FE-09 : Inscription réussie ──────────────────────────────────────

describe("U-AUTH-FE-09 : inscription réussie", () => {
  it("appelle register puis redirige vers la page d'accueil", async () => {
    // Arrange : register réussit sans erreur
    mockRegister.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    renderRegisterPage();

    // Act : remplir et soumettre le formulaire d'inscription
    await user.type(sel.email(), "new@webmall.ch");
    await user.type(sel.password(), "Password123!");
    await user.type(sel.confirm(), "Password123!");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

    // Assert : register appelé avec les bons arguments, redirection effectuée
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("new@webmall.ch", "Password123!");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});

// ─── U-AUTH-FE-10 : Email déjà utilisé ───────────────────────────────────────

describe("U-AUTH-FE-10 : email déjà utilisé", () => {
  it("affiche un message d'erreur et ne redirige pas", async () => {
    // Arrange : le serveur retourne une erreur email déjà utilisé
    mockRegister.mockRejectedValueOnce(new Error("Email déjà utilisé"));

    const user = userEvent.setup();
    renderRegisterPage();

    // Act : tenter de s'inscrire avec un email existant
    await user.type(sel.email(), "existing@webmall.ch");
    await user.type(sel.password(), "Password123!");
    await user.type(sel.confirm(), "Password123!");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

    // Assert : message d'erreur visible, pas de redirection
    await waitFor(() => {
      expect(screen.getByText(/email déjà utilisé/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// ─── U-AUTH-FE-11 : Mots de passe différents ─────────────────────────────────

describe("U-AUTH-FE-11 : mots de passe ne correspondent pas", () => {
  it("affiche un message de validation sans appeler register", async () => {
    // Arrange : mots de passe différents dans les deux champs

    const user = userEvent.setup();
    renderRegisterPage();

    // Act : saisir des mots de passe différents
    await user.type(sel.email(), "u@webmall.ch");
    await user.type(sel.password(), "Password123!");
    await user.type(sel.confirm(), "Différent456!");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

    // Assert : message d'erreur de validation affiché
    await waitFor(() => {
      expect(
        screen.getByText(/les mots de passe ne correspondent pas/i),
      ).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

// ─── U-AUTH-FE-12 : Lien vers connexion ──────────────────────────────────────

describe("U-AUTH-FE-12 : lien vers la page de connexion", () => {
  it("contient un lien pointant vers /login", () => {
    // Arrange : pas de pré-condition

    // Act : rendu
    renderRegisterPage();

    // Assert : lien vers /login présent
    const link = screen.getByRole("link", { name: /se connecter/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
