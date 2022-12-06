import { Binops, CompIR3, StatementIR3 } from "./CompIR3.ts";

type IrOp =
  | "add"
  | "mul";

function translateOp(op: Binops): IrOp {
  switch(op) {
    case "+":
      return "add";
    case "*":
      return "mul";
    default:
      throw new Error("NOT IMPLEMENTED");
  }
}

function translateOne(stmt: StatementIR3): string {
  if (typeof stmt === "object") {
    if ("assign" in stmt) {
      const dest = stmt.assign.dest;
      let operand;
      if (typeof stmt.assign.content === "object") {
        operand = stmt.assign.content.literal;
      }
      else {
        operand = `%${stmt.assign.content}`;
      }

      return `%${dest} = add i32 ${operand}, 0`;
    }
    else if ("operation" in stmt) {
      const lhs = stmt.operation.lhs;
      const rhs = stmt.operation.rhs;
      const op = translateOp(stmt.operation.op);
      const dest = stmt.operation.dest;
      return `%${dest} = ${op} i32 %${lhs}, %${rhs}`
    }
  }

  return "ERROR";
}

export function translate(code: CompIR3[]): string[] {
  return code.flatMap((command) => translateOne(command));
}
