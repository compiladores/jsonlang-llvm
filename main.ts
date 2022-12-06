import { CompIR0, JsonLang } from "./CompIR0.ts";
import { translate as translateC0 } from "./CompIR0Translator.ts";
//import { translate as translateC1 } from "./CompIR1Translator.ts";
import { translate as translateC2 } from "./CompIR2Translator.ts";
//import { translate as translateC3 } from "./CompIR3Translator.ts";
import { translate as translateC4 } from "./CompIR4Translator.ts";
//import { execute } from "./CompIr5Vm.ts";

export function compile(code: CompIR0) {
  const c1 = translateC0(code);
  //const c2 = translateC1(c1);
   const c3 = translateC2(c1);
//   const c4 = translateC3(c3);
   const c5 = translateC4(c3);
  return c5;
}

export function getIR(code: CompIR0): string[] {
  const ir = compile(code);
  return ir;
}

function test(ir: string[]) {
  const code = ir.join("\n");
  
  fetch('http://172.19.84.224:8080//',
    { method: "PUT", body: code })
    .then((response) => response.text())
    .then((text) => {
      console.log(text);
    });
}

export function main(testMode: boolean) {
  const name = Deno.args[0];
  const data = Deno.readTextFileSync(name);
  const jsonData = JSON.parse(data);
  const ir = getIR(jsonData as JsonLang);

  if (testMode) {
    test(ir);
  }
  else {
    console.log(ir);
  }
}

main(true);