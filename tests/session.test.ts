import { test } from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "../src/lib/session";

test("a fresh token verifies and carries the address and issue time", () => {
  const now = Date.now();
  const s = verifySessionToken(createSessionToken({ sub: "tz1abc" }, now));
  assert.equal(s?.sub, "tz1abc");
  assert.equal(s?.iat, now);
});

test("a token whose body was changed is refused", () => {
  const [body, mac] = createSessionToken({ sub: "tz1abc" }).split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "tz1evil", iat: Date.now(), exp: 9_999_999_999 })).toString("base64url");
  assert.equal(verifySessionToken(`${forged}.${mac}`), null);
  assert.equal(verifySessionToken(`${body}.x${mac.slice(1)}`), null);
});

test("an expired token is refused", () => {
  const longAgo = Date.now() - 8 * 24 * 3600 * 1000; /* older than the 7-day lifetime */
  assert.equal(verifySessionToken(createSessionToken({ sub: "tz1abc" }, longAgo)), null);
});

test("junk is refused", () => {
  for (const t of [undefined, "", "abc", "a.b.c", "....."]) assert.equal(verifySessionToken(t), null);
});
