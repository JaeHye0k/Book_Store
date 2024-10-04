type HttpStatusCode = {
    readonly BAD_REQUEST: 400;
    readonly NOT_FOUND: 404;
    readonly OK: 200;
    readonly CREATED: 201;
    readonly FORBIDDEN: 403;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly UNAUTHORIZED: 401;
};

export default {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    OK: 200,
    CREATED: 201,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED: 401,
} as HttpStatusCode;
