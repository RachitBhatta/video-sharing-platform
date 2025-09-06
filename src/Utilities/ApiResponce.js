class ApiResponse {
    constructor(
        statusCode,
        data ,
        message="Success",
        errors = null
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
        this.errors = errors;
    }
}

export default ApiResponse;
