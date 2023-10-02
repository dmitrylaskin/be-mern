import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import {registerValidator} from "./validations/auth.js";
import {validationResult} from "express-validator";
import UserSchema from "./Models/User.js";
import bcrypt from "bcrypt";
import {checkAuth} from "./utils/checkAuth.js";

mongoose.connect('mongodb+srv://user:12345@cluster0.jxwek2f.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => console.log('DB success'))
    .catch((error) => console.log('DB error: ', error))

const app = express()

app.use(express.json())

app.listen('4444', (error) => {
    if (error) {
        return console.log(error)
    }

    console.log('Server is running')
})

app.post('/auth/login', async (req, res) => {
    try {
        const user = await UserSchema.findOne({email: req.body.email})

        if (!user) {
            return res.status(400).json({message: 'user is not found'})
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if (!isValidPass) {
            return res.status(400).json({message: 'wrong email or password'})
        }

        const token = jwt.sign({_id: user._id},
            'secret123',
            {expiresIn: '30d'}) // срок хранияния токена - 30 дней

        const {passwordHash, ...userData} = user._doc

        res.json({
            ...userData,
            token
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'authorization failed',
        })
    }
})

app.post('/auth/register', registerValidator, async (req, res) => {
    try {
        console.log('request: ', req.body)

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }

        // шифрование пароля
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        // создание пльзователя для бд
        const doc = new UserSchema({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        })

        const user = await doc.save()

        // jwt token регистрации
        const token = jwt.sign({
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d', // срок хранияния токена - 30 дней
            })

        const {passwordHash, ...userData} = user._doc

        res.json({
            ...userData,
            token
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'register error',
        })
    }
})

app.get('/auth/me', checkAuth, async (req, res) => {
    try {
        const user = await UserSchema.findById(req.userId)

        if (!user) {
           return res.status(404).json({
               message: 'user is not found',
           })
        }

        const {passwordHash, ...userData} = user._doc

        res.json(userData)

    } catch (error) {
        res.status(500).json({
            message: 'no access',
        })
    }
})