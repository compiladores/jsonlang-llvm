/**
 * CompiIR2 without expressions
 */
type Label = string;
type operand = string | number
export type StatementIR3 =
  | { push: number | { literal: number } }
  | { assign: { dest: operand, content: operand | { literal: number }}}
  | { operation: { dest: number, lhs: number, op: Binops, rhs: number}}
  | { bz: Label }
  | { bnz: Label }
  | { jmp: Label }
  | { pop: number }
  | "callBegin"
  | { callEnd: Label }
  | "return"
  | {
    functionIntro: number[];
  }
  | Binops
  | Unops
  | { lbl: Label };

export type Binops =
  | "+"
  | "-"
  | "*"
  | "/"
  | "^"
  | "%"
  | "&"
  | "|"
  | ">>"
  | "<<"
  | "<"
  | "<="
  | ">"
  | ">="
  | "=="
  | "~="
  | "and"
  | "or";
type Unops = "neg" | "!" | "~";

export type CompIR3 = StatementIR3;
