import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ChatWidget from "./ChatWidget";

const readyResponse = () => ({
  ok: true,
  json: async () => ({ available: true }),
});

function renderWidget() {
  return render(
    <MemoryRouter>
      <ChatWidget />
    </MemoryRouter>,
  );
}

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("announces availability and opens an accessible chat dialog", async () => {
    fetch.mockResolvedValueOnce(readyResponse());
    renderWidget();
    fireEvent.click(
      screen.getByRole("button", { name: "Open Julz Assistant chat" }),
    );

    expect(
      await screen.findByRole("dialog", { name: "Julz Assistant" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Ready to help")).toBeInTheDocument();
    expect(
      screen.getByRole("log", { name: "Chat messages" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Browse packages")).toBeInTheDocument();
  });

  it("sends a question and renders the assistant response with an internal link", async () => {
    fetch.mockResolvedValueOnce(readyResponse()).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "You can request a consultation at /plan." }),
    });
    renderWidget();
    fireEvent.click(
      screen.getByRole("button", { name: "Open Julz Assistant chat" }),
    );
    await screen.findByText("Ready to help");

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Ask about packages, products, or planning",
      }),
      {
        target: { value: "How do I plan?" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("link", { name: "/plan" })).toHaveAttribute(
      "href",
      "/plan",
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("closes on Escape and returns focus to the launcher", async () => {
    fetch.mockResolvedValueOnce(readyResponse());
    renderWidget();
    const launcher = screen.getByRole("button", {
      name: "Open Julz Assistant chat",
    });
    fireEvent.click(launcher);
    const dialog = await screen.findByRole("dialog", {
      name: "Julz Assistant",
    });
    await screen.findByText("Ready to help");

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it("shows the provider rate-limit message without losing the user's question", async () => {
    fetch.mockResolvedValueOnce(readyResponse()).mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: new Headers(),
      json: async () => ({
        message:
          "The assistant's AI provider is temporarily rate-limiting requests.",
      }),
    });
    renderWidget();
    fireEvent.click(
      screen.getByRole("button", { name: "Open Julz Assistant chat" }),
    );
    await screen.findByText("Ready to help");
    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Ask about packages, products, or planning",
      }),
      {
        target: { value: "Where are packages?" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "temporarily rate-limiting",
    );
    expect(screen.getByText("Where are packages?")).toBeInTheDocument();
  });
});
