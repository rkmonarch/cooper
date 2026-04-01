/**
 * Parses the structured content string stored per listing into typed fields.
 */

export type ParsedContent =
  | { type: "ai-image"; fullImageUrl: string; aiModel: string; resolution: string; styleTags: string; license: string }
  | { type: "research"; reportUrl: string }
  | { type: "prompt"; worksWithModels: string; useCase: string; promptText: string }
  | { type: "dataset"; downloadUrl: string; dataFormat: string; recordCount: string; dateRange: string; columnSchema: string }
  | { type: "other"; url: string; raw: string };

export function parseContent(category: string, raw: string): ParsedContent {
  const lines = raw.split("\n");

  function get(prefix: string): string {
    const line = lines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : "";
  }

  switch (category) {
    case "ai-image":
      return {
        type: "ai-image",
        fullImageUrl: get("Full-resolution URL:"),
        aiModel: get("Model:"),
        resolution: get("Resolution:"),
        styleTags: get("Style:"),
        license: get("License:"),
      };

    case "research":
      return {
        type: "research",
        reportUrl: get("Full report:"),
      };

    case "prompt": {
      // Everything after the blank line following "Use case:" is the prompt text
      const blankIdx = lines.findIndex((l, i) => i > 2 && l.trim() === "");
      const promptText = blankIdx >= 0 ? lines.slice(blankIdx + 1).join("\n").trim() : "";
      return {
        type: "prompt",
        worksWithModels: get("Works with:"),
        useCase: get("Use case:"),
        promptText,
      };
    }

    case "dataset":
      return {
        type: "dataset",
        downloadUrl: get("Download:"),
        dataFormat: get("Format:"),
        recordCount: get("Records:"),
        dateRange: get("Date range:"),
        columnSchema: get("Columns:"),
      };

    default: {
      const urlMatch = raw.match(/https?:\/\/\S+/);
      return { type: "other", url: urlMatch?.[0] ?? "", raw };
    }
  }
}

/** Returns a suggested filename for download */
export function suggestFilename(title: string, parsed: ParsedContent): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  switch (parsed.type) {
    case "ai-image":   return `${slug}.png`;
    case "research":   return `${slug}.pdf`;
    case "prompt":     return `${slug}.txt`;
    case "dataset":    return `${slug}.csv`;
    default:           return slug;
  }
}
