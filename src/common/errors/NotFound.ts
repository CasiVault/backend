import { HttpError } from './HttpError';


export class NotFound extends HttpError {
    name = 'NotFound';

    constructor(message?: string) {
        super(404, message);

        Object.setPrototypeOf(this, NotFound.prototype);
    }
}