'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');

/**
 * Load comment
 */

exports.load = function(req, res, next, id) {
  req.comment = req.post.comments.find(comment => comment.id === id);

  if (!req.comment) return next(new Error('Comment not found'));
  next();
};

/**
 * Create comment
 */

exports.create = async(function*(req, res) {
//   console.log("COMMENTS",req.body)
  const post = req.post;
//   console.log("POST",req.post)
  yield post.addComment(req.user,req.body);
  res.redirect(`/posts/${post._id}`);
});

/**
 * Delete comment
 */

exports.destroy = async(function*(req, res) {
  yield req.post.removeComment(req.params.postCommentId);
  req.flash('info', 'Removed comment');
  res.redirect(`/posts/${req.post.id}`);
});
