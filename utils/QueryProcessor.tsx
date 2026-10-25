function multiplyIntegerStrings(left: string, right: string): string {
  const negative = left.startsWith("-") !== right.startsWith("-");
  const leftDigits = left.replace(/^-/, "");
  const rightDigits = right.replace(/^-/, "");
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

  const power = query.match(/(-?\d+)\s+to the power of\s+(\d+)/i);
  if (power) {
    const exponent = Number(power[2]);
    if (Number.isSafeInteger(exponent) && exponent <= 1000) {
      let result = "1";
      let factor = power[1];
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
  }

  const arithmetic = query.match(/\d+(?:\.\d+)?(?:\s+(?:plus|minus)\s+\d+(?:\.\d+)?)+/i);
  if (arithmetic) {
    const parts = arithmetic[0].match(/\d+(?:\.\d+)?|plus|minus/gi);
    if (parts) {
      let result = Number(parts[0]);
      for (let index = 1; index < parts.length; index += 2) {
        const operand = Number(parts[index + 1]);
        result = parts[index].toLowerCase() === "plus"
          ? result + operand
          : result - operand;
      }
      return String(result);
    }
  }

  if (query.toLowerCase().includes("andrew id")) {
    return "hmostafa";
  }


  return "";
}
