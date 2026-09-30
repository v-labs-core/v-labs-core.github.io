const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const html = readFileSync(resolve(__dirname, "../docs/index.html"), "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];

function setup(fetch, valid = true) {
  const attributes = new Map();
  const button = { disabled: false };
  const status = { textContent: "" };
  let onSubmit;
  let resetCount = 0;
  const form = {
    name: { value: "Test User" },
    company: { value: "Test Company" },
    email: { value: "test@example.com" },
    interest: { value: "Consumer application" },
    message: { value: "A test project inquiry." },
    botcheck: { checked: false },
    classList: { add() {}, remove() {} },
    reportValidity: () => valid,
    reset: () => { resetCount++; },
    querySelector: () => button,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
    addEventListener: (event, listener) => { if (event === "submit") onSubmit = listener; },
  };
  const document = {
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: (id) => id === "contact-form" ? form : status,
  };
  const window = {
    location: { hash: "" },
    VINDEM_LABS_CONFIG: { contactEndpoint: "contact.php" },
  };
  runInNewContext(script, { document, window, fetch, Error });
  return { form, button, status, attributes, resets: () => resetCount,
    submit: () => onSubmit({ preventDefault() {} }) };
}

test("invalid fields do not send a request", async () => {
  const page = setup(() => assert.fail("Unexpected request"), false);
  await page.submit();
  assert.match(page.status.textContent, /required fields/);
  assert.equal(page.button.disabled, false);
});

test("a pending submission blocks duplicates and restores the button after success", async () => {
  let complete;
  let calls = 0;
  const page = setup((url, options) => {
    calls++;
    assert.equal(url, "contact.php");
    assert.equal(options.method, "POST");
    assert.equal(JSON.parse(options.body).email, "test@example.com");
    return new Promise((resolve) => { complete = resolve; });
  });
  const pending = page.submit();
  assert.equal(page.button.disabled, true);
  assert.equal(page.attributes.get("aria-busy"), "true");
  await page.submit();
  assert.equal(calls, 1);
  complete({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.equal(page.resets(), 1);
  assert.match(page.status.textContent, /has been sent/);
  assert.equal(page.button.disabled, false);
  assert.equal(page.attributes.has("aria-busy"), false);
});

for (const [name, fetch] of [
  ["server rejection", async () => ({ ok: false, json: async () => ({ success: false, message: "Please try again later." }) })],
  ["invalid JSON", async () => ({ ok: true, json: async () => { throw new SyntaxError(); } })],
  ["unconfirmed delivery", async () => ({ ok: true, json: async () => ({}) })],
  ["network failure", async () => { throw new Error("Network unavailable"); }],
]) {
  test(`${name} retains input and allows retry`, async () => {
    const page = setup(fetch);
    await page.submit();
    assert.equal(page.resets(), 0);
    assert.equal(page.form.message.value, "A test project inquiry.");
    assert.equal(page.button.disabled, false);
    assert.equal(page.attributes.has("aria-busy"), false);
    assert.ok(page.status.textContent.length > 0);
    assert.doesNotMatch(page.status.textContent, /has been sent/);
  });
}
