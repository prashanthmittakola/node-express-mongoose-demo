"use strict";

const mongoose = require("mongoose");
const { wrap: async } = require('co');
const only = require('only');
const Post = mongoose.model("Post");
const assign = Object.assign;


/*
* Load
*/
exports.load = async(function*(req, res, next, postId){
    // console.log("HI, post")
    try {
        req.post = yield Post.load(postId);
        if (!req.post) return next(new Error("Post Not Found"))
    } catch (error) {
        return next(error)
    }
    next();
});


/**
 * List
 */

exports.index = async(function*(req, res) {
    const page = (req.query.page > 0 ? req.query.page : 1) - 1;
    const _id = req.query.item;
    const limit = 15;
    const options = {
      limit: limit,
      page: page
    };
  
    if (_id) options.criteria = { _id };
  
    const posts = yield Post.list(options);
    const count = yield Post.countDocuments();
  
    res.render('posts/index', {
      title: 'Posts',
      posts: posts,
      page: page + 1,
      pages: Math.ceil(count / limit)
    });
});

/*
* New post
*/
exports.new = (req, res) => {
    res.render("posts/new", {
        title: "New Post",
        post: new Post()
    });
};

/**
 * Create post
 */

exports.create = async(function*(req, res){
    const post = new Post(only(req.body, 'title description'));
    post.user=req.user;
    try {
      yield post.uploadAndSave(req.file);
      req.flash('success', 'Successfully created post!');
      res.redirect(`/posts/${post._id}`);
    } catch (err) {
      res.status(422).render('posts/new', {
        title: post.title || 'New Post',
        errors: [err.toString()],
        post
      });
    }
});


/**
 * Edit post
 */

 exports.edit = (req, res) => {
    res.render('posts/edit', {
        title: 'Edit ' + req.post.title,
        post: req.post
    });
};

/**
 * update post
 */

 exports.update = async(function*(req, res) {
    const post = req.post;
    assign(post, only(req.body, 'title description userName'));
    try {
      yield post.uploadAndSave(req.file);
      res.redirect(`/posts/${post._id}`);
    } catch (err) {
      res.status(422).render('posts/edit', {
        title: 'Edit ' + post.title,
        errors: [err.toString()],
        post
      });
    }
});

/**
 * Show
 */

exports.show = function(req, res) {
    // console.log("POSTS REQ",req.post);
    res.render('posts/show', {
        title: req.post.title,
        post: req.post
    });
};

/**
 * Delete post
 */

exports.destroy = async(function*(req, res) {
    yield req.post.remove();
    req.flash('info', 'Deleted successfully');
    res.redirect("/posts");
})
