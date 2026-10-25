function normalizeInteger(value: string): string {
  const negative = value.startsWith("-");
  const digits = value.replace(/^-/, "").replace(/^0+/, "") || "0";
  return negative && digits !== "0" ? `-${digits}` : digits;
}

function compareAbsoluteIntegers(left: string, right: string): number {
  const normalizedLeft = left.replace(/^-/, "").replace(/^0+/, "") || "0";
  const normalizedRight = right.replace(/^-/, "").replace(/^0+/, "") || "0";
  if (normalizedLeft.length !== normalizedRight.length) {
    return normalizedLeft.length > normalizedRight.length ? 1 : -1;
  }
  return normalizedLeft === normalizedRight ? 0 : normalizedLeft > normalizedRight ? 1 : -1;
}

function addAbsoluteIntegers(left: string, right: string): string {
  let carry = 0;
  let result = "";
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;

  while (leftIndex >= 0 || rightIndex >= 0 || carry > 0) {
    const sum = (Number(left[leftIndex] || 0) + Number(right[rightIndex] || 0) + carry);
    result = String(sum % 10) + result;
    carry = Math.floor(sum / 10);
    leftIndex -= 1;
    rightIndex -= 1;
  }

  return result;
}

function subtractAbsoluteIntegers(left: string, right: string): string {
  let borrow = 0;
  let result = "";
  let rightIndex = right.length - 1;

  for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
    let digit = Number(left[leftIndex]) - borrow - Number(right[rightIndex] || 0);
    borrow = digit < 0 ? 1 : 0;
    if (digit < 0) digit += 10;
    result = String(digit) + result;
    rightIndex -= 1;
  }

  return result.replace(/^0+/, "") || "0";
}

function addIntegerStrings(left: string, right: string): string {
  const normalizedLeft = normalizeInteger(left);
  const normalizedRight = normalizeInteger(right);
  const leftNegative = normalizedLeft.startsWith("-");
  const rightNegative = normalizedRight.startsWith("-");
  const leftDigits = normalizedLeft.replace(/^-/, "");
  const rightDigits = normalizedRight.replace(/^-/, "");

  if (leftNegative === rightNegative) {
    const sum = addAbsoluteIntegers(leftDigits, rightDigits);
    return leftNegative ? `-${sum}` : sum;
  }

  const comparison = compareAbsoluteIntegers(leftDigits, rightDigits);
  if (comparison === 0) return "0";
  const difference = comparison > 0
    ? subtractAbsoluteIntegers(leftDigits, rightDigits)
    : subtractAbsoluteIntegers(rightDigits, leftDigits);
  return (comparison > 0 ? leftNegative : rightNegative) ? `-${difference}` : difference;
}

function multiplyIntegerStrings(left: string, right: string): string {
  const normalizedLeft = normalizeInteger(left);
  const normalizedRight = normalizeInteger(right);
  const negative = normalizedLeft.startsWith("-") !== normalizedRight.startsWith("-");
  const leftDigits = normalizedLeft.replace(/^-/, "");
  const rightDigits = normalizedRight.replace(/^-/, "");
  const product = new Array(leftDigits.length + rightDigits.length).fill(0);

  for (let leftIndex = leftDigits.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightDigits.length - 1; rightIndex >= 0; rightIndex -= 1) {
      const position = leftIndex + rightIndex + 1;
      const value = product[position] +
        Number(leftDigits[leftIndex]) * Number(rightDigits[rightIndex]);
      product[position] = value % 10;
      product[position - 1] += Math.floor(value / 10);
    }
  }

  const digits = product.join("").replace(/^0+/, "") || "0";
  return negative && digits !== "0" ? `-${digits}` : digits;
}

function integerPower(base: string, exponent: number): string {
  let result = "1";
  let factor = base;
  let remainingExponent = exponent;

  while (remainingExponent > 0) {
    if (remainingExponent % 2 === 1) {
      result = multiplyIntegerStrings(result, factor);
    }
    remainingExponent = Math.floor(remainingExponent / 2);
    if (remainingExponent > 0) {
      factor = multiplyIntegerStrings(factor, factor);
    }
  }

  return result;
}

function isIntegerString(value: string): boolean {
  return /^-?\d+$/.test(value);
}

function applyOperator(left: string, right: string, operator: string): string | null {
  if (operator === "/" || !isIntegerString(left) || !isIntegerString(right)) {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (operator === "+") return String(leftNumber + rightNumber);
    if (operator === "-") return String(leftNumber - rightNumber);
    if (operator === "*") return String(leftNumber * rightNumber);
    if (operator === "/") return rightNumber === 0 ? null : String(leftNumber / rightNumber);
    if (operator === "^") return String(Math.pow(leftNumber, rightNumber));
    return null;
  }

  if (operator === "+") return addIntegerStrings(left, right);
  if (operator === "-") return addIntegerStrings(left, `-${right}`);
  if (operator === "*") return multiplyIntegerStrings(left, right);
  if (operator === "^") {
    const exponent = Number(right);
    return Number.isSafeInteger(exponent) && exponent >= 0 && exponent <= 1000
      ? integerPower(left, exponent)
      : String(Math.pow(Number(left), exponent));
  }
  return null;
}

function evaluateArithmetic(expression: string): string | null {
  const tokens = expression.match(/\d+(?:\.\d+)?|to the power of|power of|multiplied by|divided by|plus|minus|times|over|add|subtract|multiply|divide|[+*/^×÷-]/gi);
  if (!tokens || tokens.length < 3) return null;

  const normalizedTokens = tokens.map((token) => {
    const word = token.toLowerCase();
    if (["plus", "add", "+"].includes(word)) return "+";
    if (["minus", "subtract", "-"].includes(word)) return "-";
    if (["times", "multiplied by", "multiply", "*", "×"].includes(word)) return "*";
    if (["over", "divided by", "divide", "/", "÷"].includes(word)) return "/";
    if (["to the power of", "power of", "^"].includes(word)) return "^";
    return token;
  });
  const precedence: { [operator: string]: number } = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const values: string[] = [];
  const operators: string[] = [];

  const reduce = (): boolean => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (!operator || right === undefined || left === undefined) return false;
    const result = applyOperator(left, right, operator);
    if (result === null || !Number.isFinite(Number(result))) return false;
    values.push(result);
    return true;
  };

  for (let index = 0; index < normalizedTokens.length; index += 1) {
    const token = normalizedTokens[index];
    if (precedence[token] === undefined) {
      if (!/^\d+(?:\.\d+)?$/.test(token)) return null;
      values.push(token);
      continue;
    }

    const rightAssociative = token === "^";
    while (operators.length > 0 && (rightAssociative
      ? precedence[operators[operators.length - 1]] > precedence[token]
      : precedence[operators[operators.length - 1]] >= precedence[token])) {
      if (!reduce()) return null;
    }
    operators.push(token);
  }

  while (operators.length > 0) {
    if (!reduce()) return null;
  }

  return values.length === 1 ? values[0] : null;
}

function isPrime(value: number): boolean {
  if (!Number.isSafeInteger(value) || value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function scrabbleScore(word: string): number {
  const letterValues: { [letters: string]: number } = {
    AEILNORSTU: 1,
    DG: 2,
    BCMP: 3,
    FHVWY: 4,
    K: 5,
    JX: 8,
    QZ: 10,
  };

  return word.toUpperCase().split("").reduce((score, letter) => {
    const group = Object.keys(letterValues).find((letters) => letters.includes(letter));
    return score + (group ? letterValues[group] : 0);
  }, 0);
}

export default function QueryProcessor(query: string): string {
  if (query.toLowerCase().includes("shakespeare")) {
    return (
      "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
      "English poet, playwright, and actor, widely regarded as the greatest " +
      "writer in the English language and the world's pre-eminent dramatist."
    );
  }

  if (query.toLowerCase().includes("name")) {
    return "Hana";
  }

  const largest = query.match(/largest\s*:\s*([^?]+)/i);
  if (largest) {
    const values = largest[1].split(",").map((value) => value.trim());
    if (values.length > 0 && values.every((value) => /^-?\d+(?:\.\d+)?$/.test(value))) {
      return String(Math.max(...values.map(Number)));
    }
  }

  const primes = query.match(/primes?\s*:\s*([^?]+)/i);
  if (primes) {
    const values = primes[1].split(",").map((value) => value.trim());
    if (values.length > 0 && values.every((value) => /^\d+$/.test(value))) {
      return values.filter((value) => isPrime(Number(value))).join(", ");
    }
  }

  const scrabble = query.match(/scrabble\s+score\s+of\s+([a-z]+)/i);
  if (scrabble) {
    return String(scrabbleScore(scrabble[1]));
  }

  const arithmetic = query.match(/\d+(?:\.\d+)?(?:\s*(?:to the power of|power of|multiplied by|divided by|plus|minus|times|over|add|subtract|multiply|divide|[+*/^×÷-])\s*\d+(?:\.\d+)?)+/i);
  if (arithmetic) {
    return evaluateArithmetic(arithmetic[0]) || "";
  }

  if (query.toLowerCase().includes("andrew id")) {
    return "hmostafa";
  }


  return "";
}
