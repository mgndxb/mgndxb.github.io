import { codeToHtml, type ThemeRegistration } from "shiki";

/** A syntax theme in the site's palette: mint keywords, amber strings, quiet comments. */
const showroomTheme: ThemeRegistration = {
  name: "showroom",
  type: "dark",
  colors: {
    "editor.background": "#0f0f12",
    "editor.foreground": "#dce4df",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: "#8e8c86", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.other", "keyword.operator.new", "keyword.control"],
      settings: { foreground: "#7ee8b5" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
      settings: { foreground: "#ffcf7a" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.other", "support.constant"],
      settings: { foreground: "#f39b86" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"],
      settings: { foreground: "#ffffff" },
    },
    {
      scope: ["entity.name.type", "support.type", "entity.other.inherited-class", "support.class"],
      settings: { foreground: "#a9d6ec" },
    },
    {
      scope: ["variable.parameter", "meta.parameters variable"],
      settings: { foreground: "#e8d9b8" },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: { foreground: "#b7c4be" },
    },
  ],
};

export async function highlight(code: string, lang: "sql" | "ts", keyLines: number[]): Promise<string> {
  return codeToHtml(code, {
    lang,
    theme: showroomTheme,
    transformers: [
      {
        line(node, line) {
          if (keyLines.includes(line)) this.addClassToHast(node, "is-key");
        },
      },
    ],
  });
}
