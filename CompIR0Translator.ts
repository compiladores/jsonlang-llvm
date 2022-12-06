import { CompIR1 } from "./CompIR1.ts";
import { Expression, JsonLang, Statement } from "./CompIR0.ts";

class LabelFactory {
  private next = 0;
  createLabel() {
    const ret = "l" + this.next;
    this.next += 1;
    return ret;
  }
}

interface JumpLabels {
  continueLbl: string;
  breakLbl: string;
}

function translateGeneral(
  stmt: Statement<Expression>,
  labelFactory: LabelFactory,
  jumps: JumpLabels | null,
): CompIR1[] {
  if (stmt === "break") { // dejar como ejercicio 00
    if (!jumps?.breakLbl) {
      throw new Error("Cant break from this context");
    }
    return [{ jmp: jumps?.breakLbl }];
  }
  if (stmt === "continue") { // dejar como ejercicio 00
    if (!jumps?.continueLbl) {
      throw new Error("Cant break from this context");
    }
    return [{ jmp: jumps?.continueLbl }];
  }
  if ("while" in stmt) { // dejar como ejercicio 00
    const beginWhile = labelFactory.createLabel();
    const endWhile = labelFactory.createLabel();
    return [
      { lbl: beginWhile },
      { push: stmt.while },
      { bz: endWhile },
      ...translateGeneral(stmt.do, labelFactory, {
        breakLbl: endWhile,
        continueLbl: beginWhile,
      }),
      { jmp: beginWhile },
      { lbl: endWhile },
    ];
  }
  if ("until" in stmt) {
    const beginDo = labelFactory.createLabel();
    const endUntil = labelFactory.createLabel();
    return [
      { lbl: beginDo },
      ...translateGeneral(stmt.do, labelFactory, {
        breakLbl: endUntil,
        continueLbl: beginDo,
      }),
      { push: stmt.until },
      { bz: beginDo },
      { lbl: endUntil },
    ];
  }
  if ("iterator" in stmt) {
    const beginDo = labelFactory.createLabel();
    const endIterator = labelFactory.createLabel();
    const step = stmt.step ? stmt.step : 1; 
    return [
      "enterBlock",
      { declare: stmt.iterator, value: stmt.from },
      { lbl: beginDo },
      { push: { binop: "<=", argl: stmt.iterator, argr: stmt.to } },
      { bz: endIterator },
      ...translateGeneral(stmt.do, labelFactory, {
        breakLbl: endIterator,
        continueLbl: beginDo,
      }),
      { set: stmt.iterator, value: { binop: "+", argl: stmt.iterator, argr: step } },
      { jmp: beginDo },
      { lbl: endIterator },
      "exitBlock",
    ];
  }
  if ("set" in stmt || "declare" in stmt || "call" in stmt || "return" in stmt) {
    return [
      stmt
    ]
  }
  if (stmt instanceof Array) {
    const outStmt = new Array<CompIR1>();
    outStmt.push("enterBlock");
    for (const innerStmt of stmt) {
      outStmt.push(...translateGeneral(innerStmt, labelFactory, jumps));
    }
    outStmt.push("exitBlock");
    return outStmt;
  }
  if ("if" in stmt) {
    const translations = Array<CompIR1>();
    const endIf = labelFactory.createLabel();
    for (let i=0; i<stmt.if.length; ++i) {
      const nextStep = labelFactory.createLabel();
      translations.push(
        { push: stmt.if[i].cond },
        { bz: nextStep },
        ...translateGeneral(stmt.if[i].then, labelFactory, jumps),
        { jmp: endIf },
        { lbl: nextStep },
      )
    }
    if (stmt.else !== undefined) {
      translations.push(
        ...translateGeneral(stmt.else, labelFactory, jumps),
      )
    }
    translations.push(
      { lbl: endIf },
    )

    return translations;
  }
  throw new Error("NO IMPLEMENTADO")
}
export function translate(code: JsonLang): CompIR1[] {
  const labelFactory = new LabelFactory();
  return code.flatMap((c) => {
    if (typeof c === "object" && "function" in c) {
      const afterFunction = labelFactory.createLabel();
      return [
        { jmp: afterFunction },
        { lbl: c.function },
        { functionIntro: c.args },
        ...translateGeneral(c.block, labelFactory, null),
        "functionEnd",
        { lbl: afterFunction },
      ];
    } else {
      return translateGeneral(c, labelFactory, null);
    }
  });
}
