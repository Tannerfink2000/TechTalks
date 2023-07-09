const router = require('express').Router();
const { User, Comment } = require('../../models');
const withAuth = require('../../util/auth');

// Get all comments
router.route('/')
    .get(async (_, res) => {
        try {
            const commentsData = await Comment.findAll({
                include: [
                    { model: User, attributes: ['username'] }
                ],
                order: [['created_at', 'DESC']],
            });
            res.json(commentsData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get comments' });
        }
    })
    .post(withAuth, async (req, res) => {
        try {
            const newComment = await Comment.create({
                comment_text: req.body.comment_text,
                post_id: req.body.post_id,
                user_id: req.session.user_id,
            });
            res.json(newComment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create comment' });
        }
    });

// Get, update, delete a comment by ID
router.route('/:id')
    .get(async (req, res) => {
        try {
            const commentData = await Comment.findByPk(req.params.id);
            if (!commentData) {
                return res.status(404).json({ error: 'No comment with that ID found' });
            }
            res.json(commentData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get comment' });
        }
    })
    .put(withAuth, async (req, res) => {
        try {
            const [affectedRows] = await Comment.update({ comment_text: req.body.comment_text }, { where: { id: req.params.id } });
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'No comment with that ID found' });
            }
            res.json({ message: 'Successfully updated comment!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update comment' });
        }
    })
    .delete(withAuth, async (req, res) => {
        try {
            const affectedRows = await Comment.destroy({ where: { id: req.params.id } });
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'No comment with that ID found' });
            }
            res.json({ message: 'Successfully deleted comment' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete comment' });
        }
    });

module.exports = router;
