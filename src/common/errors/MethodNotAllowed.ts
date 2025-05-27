import { HttpError } from './HttpError';


export class MethodNotAllowed extends HttpError {
    name = 'MethodNotAllowed';

    constructor(message?: string) {
        super(405, message);

        Object.setPrototypeOf(this, MethodNotAllowed.prototype);
    }
}