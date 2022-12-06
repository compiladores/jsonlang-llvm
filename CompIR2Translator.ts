import { CompIR1, Expression, StatementIR1 } from "./CompIR1.ts";
import { CompIR3, StatementIR3 } from "./CompIR3.ts";

function translateExpr(expr: Expression, translation: StatementIR3[]) : number {
  if (typeof expr === "number") {
    translation.push({assign: {dest: 44, content: {literal: expr}}});
    return 44;
  }  
  else if (typeof expr === "string") {
    translation.push({assign: {dest: 22, content: expr}});
    return 22;
  }
  else if ("binop" in expr) {
    const a= translateExpr(expr.argr, translation);
    const b= translateExpr(expr.argl, translation);
    translation.push({operation: {dest: 66, lhs: a, rhs: b, op: expr.binop}});
    return 66;
  }
  else if ("unop" in expr) {
    translateExpr(expr.arg, translation);
    if (expr.unop === "-") {
      translation.push("neg");
    } else {
      translation.push(expr.unop);
    }
    return -1;
  }
  else if ("call" in expr) {
    translation.push("callBegin");
    expr.args.flatMap((argument) => translateExpr(argument, translation));
    translation.push({ callEnd: expr.call });
    return -1;
  }
  return -1;
}

function translateOne(stmt: StatementIR1<Expression>): StatementIR3[] {
  const translations = Array<StatementIR3>();
  if (typeof stmt === "object") {
    if ("set" in stmt) {
      const res = translateExpr(stmt.value, translations);
      translations.push({assign: {dest: stmt.set, content: res}});
    }
  }

  return translations;
}

export function translate(code: CompIR1[]): CompIR3[] {
  return code.flatMap((command) => translateOne(command));
}
