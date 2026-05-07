import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";

// IntersectionObserver — requis par le hook useInView dans HomePage
beforeEach(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // EventSource — requis par WinBanner (flux SSE des gains en direct)
  // Doit être une fonction régulière (pas arrow) pour être appelable avec new
  global.EventSource = vi.fn(function MockEventSource() {
    return {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
    };
  }) as unknown as typeof EventSource;
});
