const errMessage = (message, statusCode) => {
    const err = new Error();
    err.message = message
    err.statusCode = statusCode;
    throw err;
}

module.exports = errMessage;