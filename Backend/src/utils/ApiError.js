class ApiError extends Error {
    constructor(
        statusCode,
        message = "Internal Server Error",
        error = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.error = error;
        this.sucess = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.stack);
        }
    }
}

export { ApiError }