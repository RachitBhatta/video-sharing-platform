class ApiResponse {
    constructor(
        statusCode,
        data ,
        message="Success"
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
        this.errors = errors;
    }
}

export default ApiResponse;
