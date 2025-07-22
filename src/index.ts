import { readFile } from "node:fs/promises";

async function main() {
  console.log("👋  Hello from TypeScript!");

  // demo: read package.json and print the project name
  const pkg = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8")
  );
  console.log(`Project name: ${pkg.name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
