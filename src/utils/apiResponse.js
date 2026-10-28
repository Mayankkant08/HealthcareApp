class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static created(res, message = 'Created successfully', data = null) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
