/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const newObj = {};
  if (typeof obj !== "object") return undefined;
  for (const [key, value] of Object.entries(obj)) {
    newObj[value] = key;
  }
  return newObj;
}
