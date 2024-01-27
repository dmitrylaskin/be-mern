import PostSchema from "../Models/Post.js";

export const createPost = async (req, res) => {
    try {
        const doc = new PostSchema({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId
        })

        const post = await doc.save()

        console.log('post: ', post)
        res.send(post)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'create article failed',
        })
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await PostSchema.find().populate('user').exec() // populate('user').exec() - получение объекта user

        res.send(posts)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'posts request failed',
        })
    }
}

export const getPost = async (req, res) => {
    try {
        const posts = await PostSchema.findOneAndUpdate(
            {
                _id: req.params.id,
            },
            {
                $inc: {viewsCount: 1}
            },
            {
                returnDocument: 'after'
            }
        )

        res.send(posts)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'article request failed',
        })
    }
}

export const removePost = async (req, res) => {
    try {
        const post = await PostSchema.findOneAndDelete({_id: req.params.id})

        res.json(post)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'article remove failed',
        })
    }
}

export const updatePost = async (req, res) => {
    try {
        const post = await PostSchema.findOneAndUpdate(
            {
                _id: req.params.id
            },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags,
                user: req.userId
            }
        )

        res.json(post)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'article update failed',
        })
    }
}

export const getLastTags = async (req, res) => {
    try {
        const lastFivePosts = await PostSchema.find().limit(5).exec()
        const tags = lastFivePosts.map(post => post.tags).flat().slice(0, 5)

        res.send(tags)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: 'tags request failed',
        })
    }
}