import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginZod } from "@kubb/plugin-zod";
import { writeFile } from "fs/promises";

async function downloadFile() {
  const url = "http://localhost:8080/v3/api-docs.yaml";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.arrayBuffer();
  await writeFile("api-docs.yaml", Buffer.from(data));

  console.log("Datei erfolgreich gespeichert!");
}

export default defineConfig(async () => {
  await downloadFile();

  return {
    name: "recipify",
    root: ".",
    input: {
      path: "./api-docs.yaml",
    },
    output: {
      clean: true,
      extension: { ".ts": "" },
      path: "./src/_generated",
      barrelType: "all",
    },
    plugins: [
      pluginOas(),
      pluginZod({
        include: [{ type: "tag", pattern: /Admin/ }],
        importPath: "zod/v4",
        coercion: false,
        typed: false,
        inferred: true,
        operations: true,
        output: {
          path: "./api-types",
          barrelType: "propagate",
        },
        unknownType: "unknown",
        dateType: "stringLocal",
        version: "4",
        transformers: {
          name: (n) => {
            let newName = n.charAt(0).toUpperCase() + n.substring(1);
            if (newName.endsWith("Schema")) {
              newName = newName.substring(0, newName.length - "Schema".length);
            }
            return newName;
          },
        },
      }),
    ],
  };
});
