import UserSchema from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {validationResult} from "express-validator";

export const getLogin = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }

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
}

export const getRegister =  async (req, res) => {
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
}

export const getMe =  async (req, res) => {
    console.log('req.userId: ', req.userId)
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
}