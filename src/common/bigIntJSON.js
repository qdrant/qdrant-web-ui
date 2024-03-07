let bigintReviver;
let bigintReplacer;

if ('rawJSON' in JSON) {
  bigintReviver = function (_key, val, context) {
    if (Number.isInteger(val) && !Number.isSafeInteger(val)) {
      try {
        return BigInt(context?.source);
      } catch {
        return val;
      }
    }
    return val;
  };
  bigintReplacer = function (_key, val) {
    if (typeof val === 'bigint') {
      return JSON.rawJSON(String(val));
    }
    return val;
  };
}

export const bigIntJSON = {
  parse: function (text, reviver) {
    return JSON.parse(text, reviver || bigintReviver);
  },
  stringify: function (value, replacer, space) {
    return JSON.stringify(value, replacer || bigintReplacer, space);
  },
};
