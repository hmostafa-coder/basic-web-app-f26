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

  const addition = query.match(/(-?\d+(?:\.\d+)?)\s+plus\s+(-?\d+(?:\.\d+)?)/i);
  if (addition) {
    return String(Number(addition[1]) + Number(addition[2]));
  }

  if (query.toLowerCase().includes("andrew id")) {
    return "hmostafa";
  }


  return "";
}
