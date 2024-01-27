import {body} from "express-validator";

export const loginValidator = [
    body('email', 'email error message').isEmail(),
    body('password').isLength({min: 5}),
]