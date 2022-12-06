import { CompIR1, Expression, StatementIR1 } from "./CompIR1.ts";
import { CompIR3, StatementIR3 } from "./CompIR3.ts";

class RegisterFactory {
  private next = 0;
  GetNext() {
    this.next += 1;
    return this.next;
  }
}

function translateExpr(expr: Expression, translation: StatementIR3[], registerFactory: RegisterFactory) : number {
  if (typeof expr === "number") {
    const dest = registerFactory.GetNext();
    translation.push({assign: {dest, content: {literal: expr}}});
    return dest;
  }  
  else if (typeof expr === "string") {
    const dest = registerFactory.GetNext();
    translation.push({assign: {dest, content: expr}});
    return dest;
  }
  else if ("binop" in expr) {
    const a = translateExpr(expr.argr, translation, registerFactory);
    const b = translateExpr(expr.argl, translation, registerFactory);
    const dest = registerFactory.GetNext();
    translation.push({operation: {dest, lhs: a, rhs: b, op: expr.binop}});
    return dest;
  }
  else if ("unop" in expr) {
    translateExpr(expr.arg, translation, registerFactory);
    if (expr.unop === "-") {
      translation.push("neg");
    } else {
      translation.push(expr.unop);
    }
    return -1;
  }
  else if ("call" in expr) {
    translation.push("callBegin");
    expr.args.flatMap((argument) => translateExpr(argument, translation, registerFactory));
    translation.push({ callEnd: expr.call });
    return -1;
  }
  return -1;
}

function translateOne(stmt: StatementIR1<Expression>, registerFactory: RegisterFactory): StatementIR3[] {
  const translations = Array<StatementIR3>();
  if (typeof stmt === "object") {
    if ("set" in stmt) {
      const res = translateExpr(stmt.value, translations, registerFactory);
      translations.push({assign: {dest: stmt.set, content: res}});
    }
  }

  return translations;
}

export function translate(code: CompIR1[]): CompIR3[] {
  const registerFactory = new RegisterFactory();
  return code.flatMap((command) => translateOne(command, registerFactory));
}
