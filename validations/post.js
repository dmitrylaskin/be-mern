import {body} from "express-validator";

export const postValidator = [
    body('title', 'Enter title article').isLength({min: 3}).isString(),
    body('text', 'Enter title text').isLength({min: 3}).isString(),
    body('tags', 'Tag format error (it should be an array)').optional().isString(),
    body('imageUrl', 'URL image error').optional().isString(),
]