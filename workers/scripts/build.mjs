import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const jsonPath = join(__dirname, "..", "..", "university.json");
const handlerPath = join(__dirname, "..", "src", "handler.js");
const outputPath = join(__dirname, "..", "src", "index.js");

const raw = readFileSync(jsonPath, "utf-8");
const parsed = JSON.parse(raw);
const data = JSON.stringify(parsed.data);

const handlerCode = readFileSync(handlerPath, "utf-8");

const outputCode = handlerCode.replace(
  "const UNIVERSITIES = env.UNIVERSITIES;",
  `const UNIVERSITIES = ${data};`
);

writeFileSync(outputPath, outputCode, "utf-8");
console.log("Built workers/src/index.js with inlined data");
