'use strict';

const config = require('../config');
const { clamp } = require('./helpers');

/**
 * ?page=2&limit=20 parametrelerini okuyup diziyi sayfalar.
 * Frontend'in sonsuz kaydirma / sayfalama yapabilmesi icin
 * meta.pagination icinde toplam sayfa, sonraki sayfa var mi gibi
 * bilgileri de doner.
 */
function paginate(items, query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || config.pagination.defaultLimit;
  const limit = clamp(requestedLimit, 1, config.pagination.maxLimit);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    },
  };
}

module.exports = paginate;
