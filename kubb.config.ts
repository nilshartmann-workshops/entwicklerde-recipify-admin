import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginZod } from "@kubb/plugin-zod";
import { exec } from "child_process";
import { writeFile } from "fs/promises";
import { promisify } from "util";

const execAsync = promisify(exec);

const apiDocsFull = "api-docs-full.yaml";
const apiDocsFiltered = "api-docs.yaml";
const outputPath = "./src/_generated";

async function formatOpenApi() {
  try {
    const { stdout, stderr } = await execAsync(
      `openapi-format ${apiDocsFull} -o ${apiDocsFiltered} -f api-docs-filter.json`,
    );
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  } catch (error) {
    console.error(
      `Could not format document: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function downloadFile() {
  const url = "http://localhost:8080/v3/api-docs.yaml";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.arrayBuffer();
  await writeFile(apiDocsFiltered, Buffer.from(data));

  await formatOpenApi();

  console.log("✅ api docs downloaded and formatted succesfully");
}

export default defineConfig(async () => {
  await downloadFile();

  return {
    name: "recipify",
    root: ".",
    input: {
      path: apiDocsFiltered,
    },
    output: {
      clean: true,
      extension: { ".ts": "" },
      path: outputPath,
      barrelType: "all",
    },
    hooks: {
      done: [
        `rimraf ${outputPath}/schemas`,
        `eslint --fix ${outputPath}`,
        `prettier --write ${outputPath}`,
      ],
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
