const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const passport = require('passport');
const { validatePostInput } = require('../../handlers/validation');

//All routes are prepended with /api/posts

// @route GET api/posts
// @desc Get all posts
// @access Public
router.get('/', (req, res, next) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json(err));
});

// @route GET api/posts/:post_id
// @desc Get a post by its ID
// @access Public
router.get('/:post_id', (req, res, next) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err => res.status(500).json(err));
});

// @route DELETE api/posts/:post_id
// @desc Delete a post by its ID
// @access Private
router.delete(
  '/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (!post) {
          return res
            .status(404)
            .json({ notFound: 'No post found with that ID.' });
        }

        if (req.user.id !== post.user.toString()) {
          return res
            .status(401)
            .json({ unAuthorized: 'Only the post owner can do that.' });
        }

        return post.remove();
      })
      .then(() => res.json({ message: 'Successfully deleted post.' }))
      .catch(err => res.status(500).json(err));
  }
);

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const userId = req.user.id;
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    //well get the name & avatar from the logged in state w/ redux
    // they will also be on req.body
    const newPost = new Post({
      ...req.body,
      user: userId
    });
    newPost
      .save()
      .then(post => res.status(201).json(post))
      .catch(err => res.status(500).json(err));
  }
);

// @route PUT api/posts/like/:post_id
// @desc Add a like on a post
// @access Private
router.put(
  '/like/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const userId = req.user.id;
    Post.findById(req.params.post_id)
      .then(post => {
        //likes is an array of userId's
        //if the ID is already present add a like, else remove it
        const isLiked = post.likes.filter(
          like => like.user.toString() === userId
        );
        if (isLiked.length) {
          return res
            .status(400)
            .json({ message: 'The user already liked this post' });
        }
        post.likes.push(userId);
        return post.save();
      })
      .then(post => res.json(post))
      .catch(err => res.status(500).json(err));
  }
);

// @route PUT api/posts/unlike/:post_id
// @desc Remove a like on a post
// @access Private
router.put(
  '/unlike/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const userId = req.user.id;
    Post.findById(req.params.post_id)
      .then(post => {
        const isLiked = post.likes.filter(
          like => like.user.toString() === userId
        );
        if (!isLiked.length) {
          return res
            .status(400)
            .json({ message: 'The user has not liked this post.' });
        }

        post.likes = post.likes.filter(like => like.user.toString() !== userId);
        return post.save();
      })
      .then(post => res.json(post))
      .catch(err => res.status(500).json(err));
  }
);

// @route Post api/posts/comment/:post_id
// @desc Adda comment on a post
// @access Private
router.post(
  '/comment/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userId = req.user.id;
    Post.findById(req.params.post_id)
      .then(post => {
        //name and avatar will be coming from the req.body
        post.comments.unshift({
          ...req.body,
          user: userId
        });
        return post.save();
      })
      .then(post => res.status(201).json(post))
      .catch(err => res.status(500).json(err));
  }
);

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc Remove a comment from a post
// @access Private
router.delete(
  '/comment/:post_id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const { post_id, comment_id } = req.params;
    const userId = req.user.id;
    Post.findById(post_id)
      .then(post => {
        //see if comment exists
        const existingComment = post.comments.find(
          comm => comm._id.toString() === comment_id
        );
        if (!existingComment) {
          return res
            .status(404)
            .json({ message: 'No comment found with that ID.' });
        }
        if (existingComment.user.toString() !== userId) {
          return res.status(401).json({ message: 'Unauthorized.' });
        }

        post.comments = post.comments.filter(
          comm => comm._id.toString() !== comment_id
        );
        return post.save();
      })
      .then(() => res.json({ message: 'Successfully deleted comment.' }))
      .catch(err => res.status(500).json(err));
  }
);

module.exports = router;
