import { HttpError } from './HttpError';


export class ServerError extends HttpError {
    name = 'ServerError';

    constructor(message?: string) {
        super(500, message);

        Object.setPrototypeOf(this, ServerError.prototype);
    }
}