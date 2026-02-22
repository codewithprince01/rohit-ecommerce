/**
 * Standard success response
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response
 */
export const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 */
export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

/**
 * Created response (201)
 */
export const createdResponse = (res, data, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

/**
 * No content response (204)
 */
export const noContentResponse = (res) => {
  return res.status(204).send();
};
