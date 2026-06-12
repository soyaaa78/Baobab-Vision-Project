import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdminPasswordPolicyErrors,
  isAdminPasswordValid,
} from "./adminPasswordPolicy.js";

test("isAdminPasswordValid accepts a password that satisfies the shared policy", () => {
  assert.equal(isAdminPasswordValid("Strong1!"), true);
});

test("getAdminPasswordPolicyErrors returns no errors for a compliant password", () => {
  assert.deepEqual(getAdminPasswordPolicyErrors("Baobab123!"), []);
});

test("getAdminPasswordPolicyErrors reports length violations", () => {
  assert.deepEqual(getAdminPasswordPolicyErrors("Aa1!aaa"), [
    "Use 8-32 characters.",
  ]);

  assert.deepEqual(getAdminPasswordPolicyErrors(`Aa1!${"a".repeat(29)}`), [
    "Use 8-32 characters.",
  ]);
});

test("getAdminPasswordPolicyErrors reports missing character classes", () => {
  assert.deepEqual(getAdminPasswordPolicyErrors("password"), [
    "Add an uppercase letter.",
    "Add a number.",
    "Add a special character (!@#$%^&*).",
  ]);

  assert.deepEqual(getAdminPasswordPolicyErrors("PASSWORD1!"), [
    "Add a lowercase letter.",
  ]);
});

test("getAdminPasswordPolicyErrors requires at least one configured special character", () => {
  assert.deepEqual(getAdminPasswordPolicyErrors("Password1?"), [
    "Add a special character (!@#$%^&*).",
  ]);

  assert.deepEqual(getAdminPasswordPolicyErrors("Password1*"), []);
});
