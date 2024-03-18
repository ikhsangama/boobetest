class RequestError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.name = "BadRequest";
        this.code = code;
        this.message = message;
    }
}

class ServerError extends Error {
    constructor(message, code = 500) {
        super(message);
        this.code = code;
    }
}

const BadRequest = new RequestError("The request you've made is incorrect.");

const ProfileNotFound = new RequestError("We're sorry, but the profile you're looking for could not be found.", 404);

const InternalServerError = new ServerError("We've encountered a server error. Our team is working to fix it.");

export {
    BadRequest,
    ProfileNotFound,
    InternalServerError,
    ServerError,
    RequestError
};