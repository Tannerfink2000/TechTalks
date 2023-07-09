const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../util/auth');

router.route('/login')
    .post(async (req, res) => {
        try {
            const userData = await User.findOne({ where: { username: req.body.username } });

            if (!userData || !(await userData.checkPassword(req.body.password))) {
                res.status(400).json({ message: 'Incorrect email or password, please try again' });
                return;
            }

            req.session.save(() => {
                req.session.user_id = userData.id;
                req.session.logged_in = true;
                res.json({ user: userData, message: 'You are now logged in!' });
            });

        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    });

router.route('/')
    .post(async (req, res) => {
        try {
            const newUser = await User.create({
                username: req.body.username,
                password: req.body.password,
            });

            req.session.save(() => {
                req.session.user_id = newUser.id;
                req.session.logged_in = true;
                res.json({ user: newUser, message: 'Logged In!' });
            });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    })
    .get(async (_, res) => {
        try {
            const userData = await User.findAll({
                attributes: { exclude: ['password'], includes: [{ model: Post }, { model: Comment }] },
            });
            res.json(userData);
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    });

router.route('/logout')
    .post((req, res) => {
        if (req.session.logged_in) {
            req.session.destroy(() => {
                res.status(204).end();
            });
        } else {
            res.status(404).end();
        }
    });

router.route('/:id')
    .get(withAuth, async (req, res) => {
        try {
            const userData = await User.findByPk(req.params.id, {
                attributes: { exclude: ['password'], includes: [{ model: Post }, { model: Comment }] }
            });
            if (!userData) {
                res.status(404).json({ message: 'No user found with that ID' });
                return;
            }
            res.json(userData);
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    })
    .put(withAuth, async (req, res) => {
        try {
            const [affectedRows] = await User.update(req.body, {
                where: {
                    id: req.params.id,
                }
            });
            if (affectedRows === 0) {
                res.status(404).json({ message: 'No user found with that ID' });
                return;
            }
            res.json({ message: 'Successfully updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    })
    .delete(withAuth, async (req, res) => {
        try {
            const affectedRows = await User.destroy({
                where: {
                    id: req.params.id,
                }
            });
            if (affectedRows === 0) {
                res.status(404).json({ message: 'No user found with that ID' });
                return;
            }
            res.json({ message: 'Successfully deleted user' });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    });

module.exports = router;
