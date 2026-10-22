import type { CharacterDTO } from "lumiverse-spindle-types";
import { renderProfileMarkdown } from "./profile-markdown";

export interface ProfileActions {
  listWorldBooks(): Promise<Array<{ id: string; name: string }>>;
  openWorldBook(id: string): Promise<void>;
}

const icons = {
  book: '<path d="M12 7v14m0-14C9 5 5 5 2 6v14c3-1 7-1 10 1 3-2 7-2 10-1V6c-3-1-7-1-10 1Z"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h8"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-5 5V5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v10Z"/>',
};

const fields = [
  ["description", "Description", "No description defined", "book"],
  ["personality", "Personality", "No personality defined", "sparkles"],
  ["scenario", "Scenario", "No scenario defined", "file"],
  ["system_prompt", "System Prompt", "No system prompt", "file"],
  ["post_history_instructions", "Post-History Instructions", "No post-history instructions", "file"],
  ["mes_example", "Message Examples", "No message examples", "message"],
  ["first_mes", "First Message", "No first message", "message"],
] as const;

export function createProfileView(actions: ProfileActions) {
  const element = document.createElement("div");
  element.className = "cnhr-profile";
  const expanded = new Map<string, boolean>();
  let characterId: string | null = null;
  let renderVersion = 0;

  function section(key: string, title: string, icon: keyof typeof icons, open = false) {
    const details = document.createElement("details");
    details.className = "cnhr-section";
    details.open = expanded.get(key) ?? open;
    const id = characterId;
    details.addEventListener("toggle", () => {
      if (characterId === id) expanded.set(key, details.open);
    });
    const summary = document.createElement("summary");
    const badge = document.createElement("span");
    badge.className = "cnhr-section-icon";
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</svg>`;
    const label = document.createElement("span");
    label.textContent = title;
    summary.appendChild(badge);
    summary.appendChild(label);
    details.appendChild(summary);
    element.appendChild(details);
    return details;
  }

  function prose(text: string, placeholder: string) {
    const body = document.createElement("div");
    body.className = "cnhr-prose";
    if (text.trim()) {
      body.innerHTML = renderProfileMarkdown(text);
      for (const link of body.querySelectorAll("a[href]")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    } else {
      body.className += " cnhr-empty";
      body.textContent = placeholder;
    }
    return body;
  }

  function render(character: CharacterDTO) {
    const version = ++renderVersion;
    if (characterId !== character.id) {
      expanded.clear();
      characterId = character.id;
      element.scrollTop = 0;
    }
    element.replaceChildren();
    const heading = document.createElement("h2");
    heading.className = "cnhr-character-name";
    heading.textContent = character.name || "Character Profile";
    element.appendChild(heading);
    for (const [key, title, placeholder, icon] of fields) {
      section(key, title, icon).appendChild(prose(character[key] ?? "", placeholder));
    }

    const greetings = character.alternate_greetings ?? [];
    const alternatives = section("alternate_greetings", "Alternate Greetings", "message");
    const greetingList = document.createElement("div");
    greetingList.className = "cnhr-greetings";
    if (!greetings.length) greetingList.appendChild(prose("", "No alternate greetings"));
    greetings.forEach((greeting, index) => {
      const item = document.createElement("details");
      item.className = "cnhr-greeting";
      item.open = expanded.get(`greeting-${index}`) ?? false;
      const id = characterId;
      item.addEventListener("toggle", () => {
        if (characterId === id) expanded.set(`greeting-${index}`, item.open);
      });
      const summary = document.createElement("summary");
      summary.setAttribute("aria-label", `Greeting ${index + 1} — click to expand or collapse`);
      const label = document.createElement("span");
      label.className = "cnhr-greeting-label";
      label.textContent = `Greeting ${index + 1}`;
      const preview = document.createElement("span");
      preview.className = "cnhr-greeting-preview";
      // Render the full greeting once. Use its plain text for the preview so
      // Markdown markers and nested links do not become part of the summary.
      const body = prose(greeting, "Empty greeting");
      const excerpt = body.cloneNode(true) as HTMLElement;
      for (const br of excerpt.querySelectorAll("br")) br.replaceWith("\n");
      preview.textContent = excerpt.textContent?.trim() || "Empty greeting";
      const hint = document.createElement("span");
      hint.className = "cnhr-greeting-hint";
      hint.textContent = "Click to expand";
      summary.appendChild(label);
      summary.appendChild(preview);
      summary.appendChild(hint);
      item.appendChild(summary);
      item.appendChild(body);
      greetingList.appendChild(item);
    });
    alternatives.appendChild(greetingList);

    const books = section("world_book_ids", "Attached World Books", "book");
    const bookList = document.createElement("div");
    bookList.className = "cnhr-books";
    books.appendChild(bookList);
    const ids = [...new Set(character.world_book_ids ?? [])];
    if (!ids.length) {
      bookList.appendChild(prose("", "No world books attached"));
      return;
    }

    const links = new Map<string, HTMLButtonElement>();
    const status = document.createElement("p");
    status.className = "cnhr-book-status";
    status.setAttribute("role", "status");
    for (const [index, id] of ids.entries()) {
      const link = document.createElement("button");
      link.type = "button";
      link.className = "cnhr-book-link";
      link.textContent = `World book ${index + 1}`;
      link.title = "Open in Lorebook";
      link.addEventListener("click", async () => {
        link.disabled = true;
        status.textContent = "";
        try {
          await actions.openWorldBook(id);
        } catch (error) {
          if (version === renderVersion) status.textContent = `Could not open world book: ${error}`;
        } finally {
          link.disabled = false;
        }
      });
      bookList.appendChild(link);
      links.set(id, link);
    }
    bookList.appendChild(status);
    void actions.listWorldBooks().then((available) => {
      if (version !== renderVersion) return;
      for (const book of available) {
        const link = links.get(book.id);
        if (link) link.textContent = book.name;
      }
    }).catch(() => {
      if (version === renderVersion) status.textContent = "World book names are unavailable. You can still open an attached book.";
    });
  }

  return { element, render, clear() { ++renderVersion; characterId = null; expanded.clear(); element.replaceChildren(); } };
}
