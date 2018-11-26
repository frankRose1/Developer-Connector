const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const { validatePostInput, errorResponse } = require('../handlers/validation');
const createError = require('../utils/createError');

const postController = {};

// @route GET api/posts
// @desc Get all posts
// @access Public
postController.getAllPosts = async (req, res) => {
  const posts = await Post.find({}).sort({ date: -1 });
  res.json(posts);
};

// @route GET api/posts/:post_id
// @desc Get a post by its ID
// @access Public
postController.getPostById = async (req, res) => {
  const post = await Post.findById(req.params.post_id);
  res.json(post);
};

// @route DELETE api/posts/:post_id
// @desc Delete a post by its ID
// @access Private
postController.deletePost = async (req, res) => {
  const { post_id } = req.params;
  const post = await Post.findById(post_id);
  if (!post) {
    createError('No post', 404, {
      message: `No post found with the ID ${post_id}.`
    });
  }
  if (req.user.id !== post.user.toString()) {
    createError('UnAuthorized', 401, {
      message: 'Only the post owner can do that'
    });
  }

  await post.remove();
  res.json({ message: 'Successfully deleted post.' });
};

// @route POST api/posts
// @desc Create a post
// @access Private
postController.createPost = async (req, res) => {
  const userId = req.user.id;
  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    errorResponse(errors);
  }
  //name and avatar are on req.body, being stored in redux state
  const newPost = new Post({
    ...req.body,
    user: userId
  });
  await newPost.save();
  res.status(201).json(newPost);
};

// @route PUT api/posts/like/:post_id
// @desc Add a like on a post
// @access Private
postController.likePost = async (req, res) => {
  const userId = req.user.id;
  const { post_id } = req.params;
  const post = await Post.findById(post_id);
  if (!post) {
    createError('No post', 404, {
      message: `No post found with the ID ${post_id}.`
    });
  }
  const isLiked = post.likes.filter(like => like.user.toString() === userId);
  if (isLiked.length) {
    createError('The user already liked this post', 400);
  }
  post.likes.push({ user: userId });
  await post.save();
  res.json(post);
};

// @route PUT api/posts/unlike/:post_id
// @desc Remove a like on a post
// @access Private
postController.unlikePost = async (req, res) => {
  const userId = req.user.id;
  const { post_id } = req.params;
  const post = await Post.findById(post_id);
  if (!post) {
    createError('No post', 404, {
      message: `No post found with the ID ${post_id}.`
    });
  }
  const isLiked = post.likes.filter(like => like.user.toString() === userId);
  if (!isLiked.length) {
    createError('The user has not liked this post.', 400);
  }

  post.likes = post.likes.filter(like => like.user.toString() !== userId);
  await post.save();
  res.json(post);
};

// @route Post api/posts/comment/:post_id
// @desc Adda comment on a post
// @access Private
postController.createComment = async (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    errorResponse(errors);
  }
  const post = await Post.findById(req.params.post_id);
  //name and avatar will be coming from the req.body
  post.comments.unshift({
    ...req.body,
    user: req.user.id
  });
  await post.save();
  res.status(201).json(post);
};

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc Remove a comment from a post
// @access Private
postController.deleteComment = async (req, res) => {
  const { post_id, comment_id } = req.params;
  const userId = req.user.id;
  const post = await Post.findById(post_id);
  const existingComment = post.comments.find(
    comm => comm._id.toString() === comment_id
  );
  if (!existingComment) {
    createError('No comment.', 404, {
      message: 'No comment found with that ID.'
    });
  }

  if (existingComment.user.toString() !== userId) {
    createError('Unauthorized.', 401, {
      message: 'Only the comment author can do that.'
    });
  }

  post.comments = post.comments.filter(
    comm => comm._id.toString() !== comment_id
  );
  await post.save();
  res.json({ message: 'Successfully deleted comment' });
};

module.exports = postController;
