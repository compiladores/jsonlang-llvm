import { translate as translateIR0 } from "./CompIR0Translator.ts";
import { assertEquals, assertArrayIncludes } from "https://deno.land/std@0.155.0/testing/asserts.ts";

Deno.test("extra simple if", () => {
  const translated = translateIR0([{
    "if": [{
      "cond": {
        "binop": ">",
        "argl": 4,
        "argr": 0,
      },
      "then": [{
        "set": "x",
        "value": 1,
      }],
    }],
  }]);
  const labels = ["l0", "l1"];
  assertEquals(translated, [
    { push: {binop: ">", argl: 4, argr: 0} },
    { bz: labels[1] },
    "enterBlock",
    { set: "x", value: 1 },
    "exitBlock",
    { jmp: labels[0] },
    { lbl: labels[1] },
    { lbl: labels[0] },
  ]);
});

Deno.test("extra if with else", () => {
  const translated = translateIR0([{
    "if": [{
      "cond": {
        "binop": ">",
        "argl": 4,
        "argr": 0,
      },
      "then": [{
        "set": "x",
        "value": 1,
      }],
    }],
    "else": [{
      "set": "x",
      "value": 3,
    }],
  }]);
  assertArrayIncludes(translated, [
    { push: {binop: ">", argl: 4, argr: 0} },
    { set: "x", value: 1 },
    { set: "x", value: 3 },
  ]);
});

Deno.test("extra simple while", () => {
  const translated = translateIR0([{
    "while": {
      "binop": "<",
      "argl": 0,
      "argr": 1,
    },
    "do": []
  }]);
  const labels = ["l0", "l1"];
  assertEquals(translated, [
    { lbl: labels[0] },
    { push: {binop: "<", argl: 0, argr: 1} },
    { bz: labels[1] },
    "enterBlock",
    "exitBlock",
    { jmp: labels[0] },
    { lbl: labels[1] },
  ]);
});

Deno.test("extra simple until", () => {
  const translated = translateIR0([{
    "do": [],
    "until": {
      "binop": ">",
      "argl": 0,
      "argr": 1,
    },
  }]);
  const labels = ["l0", "l1"];
  assertEquals(translated, [
    { lbl: labels[0] },
    "enterBlock",
    "exitBlock",
    { push: {binop: ">", argl: 0, argr: 1} },
    { bz: labels[0] },
    { lbl: labels[1] },
  ]);
});