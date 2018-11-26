const express = require('express');
const router = express.Router();
const passport = require('passport');
const postController = require('../../controllers/postController');
const { catchErrors } = require('../../handlers/errors');

//All routes are prepended with /api/posts

router.get('/', catchErrors(postController.getAllPosts));
router.get('/:post_id', catchErrors(postController.getPostById));
router.delete(
  '/:post_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(postController.deletePost)
);
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchErrors(postController.createPost)
);
router.put(
  '/like/:post_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(postController.likePost)
);
router.put(
  '/unlike/:post_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(postController.unlikePost)
);
router.post(
  '/comment/:post_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(postController.createComment)
);
router.delete(
  '/comment/:post_id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(postController.deleteComment)
);

module.exports = router;
