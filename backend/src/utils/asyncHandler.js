'use strict';

/**
 * Async controller'lardaki hatalari otomatik olarak next()'e aktarir.
 * Her handler'da try/catch yazmaktan kurtarir.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
