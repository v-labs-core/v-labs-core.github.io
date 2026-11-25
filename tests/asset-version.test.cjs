const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");

test("the homepage stylesheet URL matches the current CSS content", () => {
  const html = readFileSync(resolve(__dirname, "../docs/index.html"), "utf8");
  const css = readFileSync(resolve(__dirname, "../docs/styles.css"));
  const version = createHash("sha256").update(css).digest("hex").slice(0, 12);
  assert.ok(html.includes(`href="styles.css?v=${version}"`),
    `Update the stylesheet URL to styles.css?v=${version} after changing CSS`);
});
