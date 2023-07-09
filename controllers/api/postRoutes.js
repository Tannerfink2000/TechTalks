const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../util/auth');

// Get and create posts
router.route('/')
    .get(async (_, res) => {
        try {
            const postData = await Post.findAll({
                include: [
                    {
                        model: Comment,
                        attributes: ['id', 'comment_text', 'user_id', 'post_id', 'created_at'],
                        include: { model: User, attributes: ['username'] }
                    }, 
                    { model: User, attributes: ['username'] }
                ]
            });
            res.json(postData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    })
    .post(withAuth, async (req, res) => {
        try {
            const newPost = await Post.create({
                title: req.body.title,
                content: req.body.content,
                user_id: req.session.user_id,
            });
            res.json(newPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    });

// Get, update, and delete a post by ID
router.route('/:id')
    .get(async (req, res) => {
        try {
            const postData = await Post.findByPk(req.params.id, {
                include: [
                    {
                        model: Comment,
                        attributes: ['id', 'comment_text', 'user_id', 'post_id', 'created_at'],
                        include: { model: User, attributes: ['username'] }
                    }, 
                    { model: User, attributes: ['username'] }
                ]
            });
            if (!postData) {
                return res.status(404).json({ error: 'No post found with that ID' });
            }
            res.json(postData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get post' });
        }
    })
    .put(withAuth, async (req, res) => {
        try {
            const [affectedRows] = await Post.update({ title: req.body.title, content: req.body.content }, { where: { id: req.params.id } });
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'No post found with that ID' });
            }
            res.json({ message: 'Post successfully updated!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update post' });
        }
    })
    .delete(withAuth, async (req, res) => {
        try {
            const affectedRows = await Post.destroy({ where: { id: req.params.id } });
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'No post found with that ID' });
            }
            res.json({ message: 'Post successfully deleted!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete post' });
        }
    });

module.exports = router;
