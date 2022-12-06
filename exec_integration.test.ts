import { testmain } from "./main.ts";
import {
  assertAlmostEquals,
  assertEquals,
} from "https://deno.land/std@0.155.0/testing/asserts.ts";

const basePath = "./tests/01.expressions/";

Deno.test("001", async () => {
  const result = await testmain(basePath + "001.json");
  assertEquals(result, "1");
});

Deno.test("002", async () => {
  const result = await testmain(basePath + "002.json");
  assertEquals(result, "3");
});
