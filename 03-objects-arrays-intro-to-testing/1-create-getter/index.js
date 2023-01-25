/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    if (Object.keys(obj).length === 0) {
      return undefined;
    }
    return path.split(".").reduce((obj, current) => obj[current], obj);
  };
}
