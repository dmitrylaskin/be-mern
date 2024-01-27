import express from 'express'
import mongoose from "mongoose";
import {registerValidator} from "./validations/auth.js";
import {checkAuth} from "./utils/checkAuth.js";
import {getLogin, getMe, getRegister} from "./Controllers/UserController.js";
import {loginValidator} from "./validations/login.js";
import {postValidator} from "./validations/post.js";
import { createPost, getAllPosts, getLastTags, getPost, removePost, updatePost } from "./Controllers/PostController.js";
import cors from "cors";

mongoose.connect('mongodb+srv://user:12345@cluster0.jxwek2f.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => console.log('DB success'))
    .catch((error) => console.log('DB error: ', error))

const app = express()

app.use(express.json())

app.use(cors())

app.listen('4444', (error) => {
    if (error) {
        return console.log(error)
    }

    console.log('Server is running')
})

app.post('/auth/login', loginValidator, getLogin)

app.post('/auth/register', registerValidator, getRegister)

app.get('/auth/me', checkAuth, getMe)

app.get('/post', getAllPosts)
app.get('/post/:id', getPost)
app.post('/post', checkAuth, postValidator, createPost)
app.delete('/post/:id', checkAuth, removePost)
app.patch('/post/:id', checkAuth, updatePost)

app.get('/tags', getLastTags)
