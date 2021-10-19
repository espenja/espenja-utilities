"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickFromObject = exports.defaultFormatters = void 0;
const defaultErrorHandler = (missingRequired) => {
    throw new Error(`Missing required variables ${missingRequired.join(", ")}`);
};
const defaultValidator = (values, missingKeys, keysMarkedRequired, errorHandler) => {
    const missingRequired = missingKeys.filter((d) => keysMarkedRequired.includes(d));
    if (missingRequired.length) {
        errorHandler(missingRequired);
    }
};
const makeDefaultFormatters = (x) => x;
exports.defaultFormatters = makeDefaultFormatters({
    isNot: (not) => (value) => value !== not,
    toInt: (value) => parseInt(value.toString()),
    toBoolean: (value) => value.toLowerCase() === "true"
});
const pickFromObject = (obj, val, options) => {
    const validator = options?.customValidator ?? defaultValidator;
    const errorHandler = options?.customErrorHandler ?? defaultErrorHandler;
    const keysMarkedRequired = [];
    const missingKeys = [];
    const findKey = (key, required, formatter) => {
        const keyArray = Array.isArray(key) ? key : [key];
        const foundKey = keyArray.find((d) => obj[d]);
        if (required) {
            keyArray.forEach((d) => keysMarkedRequired.push(d));
        }
        if (!foundKey || !obj[foundKey]) {
            keyArray.forEach((d) => missingKeys.push(d));
            return undefined;
        }
        const value = obj[foundKey];
        return formatter ? formatter(value) : value;
    };
    const required = (key, formatter) => {
        return findKey(key, true, formatter);
    };
    function optional(key, defaultValue, formatter) {
        const value = findKey(key, false, formatter);
        if (value || arguments.length === 1) {
            return value;
        }
        return defaultValue;
    }
    const values = val(required, optional);
    validator(values, missingKeys, keysMarkedRequired, errorHandler);
    return values;
};
exports.pickFromObject = pickFromObject;
//# sourceMappingURL=pickFromObject.js.map