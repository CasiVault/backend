import { HttpError } from './HttpError';


export class BadRequest extends HttpError {
    name = 'BadRequest';

    constructor(message?: string) {
        super(400, message);

        Object.setPrototypeOf(this, BadRequest.prototype);
    }
}