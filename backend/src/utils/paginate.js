/**
 * =============================================================================
 * PAGINATION UTILITY
 * =============================================================================
 * Reusable pagination helper for Mongoose queries.
 * Parses query params, applies skip/limit, and returns metadata.
 * =============================================================================
 */

/**
 * Parse pagination parameters from req.query
 * @param {object} query - Express req.query
 * @param {object} defaults - Default values { page, limit, sort }
 * @returns {{ page: number, limit: number, skip: number, sort: object }}
 */
const parsePaginationParams = (query, defaults = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || defaults.page || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaults.limit || 10));
    const skip = (page - 1) * limit;

    // Parse sort: e.g. "createdAt" or "-createdAt" for descending
    let sort = defaults.sort || { createdAt: -1 };
    if (query.sort) {
        const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
        const sortOrder = query.sort.startsWith('-') ? -1 : 1;
        sort = { [sortField]: sortOrder };
    }

    return { page, limit, skip, sort };
};

/**
 * Execute a paginated Mongoose query
 * @param {import('mongoose').Model} Model - Mongoose model
 * @param {object} filter - Mongoose filter object
 * @param {object} paginationParams - { page, limit, skip, sort }
 * @param {object} options - { select, populate }
 * @returns {Promise<{ docs: Array, pagination: object }>}
 */
const paginateQuery = async (Model, filter, paginationParams, options = {}) => {
    const { page, limit, skip, sort } = paginationParams;

    // Count total documents matching filter
    const total = await Model.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    // Build query
    let query = Model.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.select) {
        query = query.select(options.select);
    }

    if (options.populate) {
        // Support array of populate configs or single populate
        const populates = Array.isArray(options.populate) ? options.populate : [options.populate];
        for (const pop of populates) {
            query = query.populate(pop);
        }
    }

    const docs = await query;

    return {
        docs,
        pagination: {
            page,
            limit,
            total,
            pages,
        },
    };
};

module.exports = { parsePaginationParams, paginateQuery };
