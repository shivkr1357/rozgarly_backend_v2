export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calculate pagination metadata
 * @param total Total number of items
 * @param page Current page
 * @param limit Items per page
 * @returns Pagination metadata
 */
export const calculatePagination = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
};

/**
 * Apply pagination to an array of data
 * @param data Array of data to paginate
 * @param options Pagination options
 * @returns Paginated result
 */
export const paginateArray = <T>(data: T[], options: PaginationOptions): PaginationResult<T> => {
  const { page, limit } = options;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: calculatePagination(data.length, page, limit),
  };
};

/**
 * Create pagination response
 * @param data Array of data
 * @param total Total count (for database queries)
 * @param page Current page
 * @param limit Items per page
 * @returns Pagination result
 */
export const createPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  return {
    data,
    pagination: calculatePagination(total, page, limit),
  };
};

/**
 * Validate pagination parameters
 * @param page Page number
 * @param limit Items per page
 * @returns Validated pagination options
 */
export const validatePagination = (page: number, limit: number): PaginationOptions => {
  const validatedPage = Math.max(1, Math.floor(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit) || 20));

  return {
    page: validatedPage,
    limit: validatedLimit,
  };
};

/**
 * Get offset for database queries
 * @param page Page number
 * @param limit Items per page
 * @returns Offset value
 */
export const getOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Create pagination links for API responses
 * @param baseUrl Base URL for the API endpoint
 * @param pagination Pagination metadata
 * @param queryParams Additional query parameters
 * @returns Pagination links
 */
export const createPaginationLinks = (
  baseUrl: string,
  pagination: ReturnType<typeof calculatePagination>,
  queryParams: Record<string, any> = {}
): {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
} => {
  const links: any = {};
  const params = new URLSearchParams();

  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  // const queryString = params.toString();
  // const urlSuffix = queryString ? `?${queryString}` : '';

  // First page
  if (pagination.page > 1) {
    params.set('page', '1');
    links.first = `${baseUrl}?${params.toString()}`;
  }

  // Previous page
  if (pagination.hasPrev) {
    params.set('page', String(pagination.page - 1));
    links.prev = `${baseUrl}?${params.toString()}`;
  }

  // Next page
  if (pagination.hasNext) {
    params.set('page', String(pagination.page + 1));
    links.next = `${baseUrl}?${params.toString()}`;
  }

  // Last page
  if (pagination.page < pagination.totalPages) {
    params.set('page', String(pagination.totalPages));
    links.last = `${baseUrl}?${params.toString()}`;
  }

  return links;
};
