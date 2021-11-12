export class Expression {
  readonly expression: string = "";
  constructor(expression: string) {
    this.expression = expression;
  }
  calculate = (unknowns: { [key: string]: number }) => {
    let substituteExpression = this.expression;
    for (const [key, value] of Object.entries(unknowns)) {
      substituteExpression = substituteExpression.replaceAll(
        key,
        value.toString()
      );
    }

    // abs((-8)/(20*20)) + 56
    // (abs(a) + b) => {a = (c/d) -> d = (20*20); b = (56)}
    return substituteExpression;
  };
}
