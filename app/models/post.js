const mongoose = require("mongoose");
// const notify = require('../mailer');


const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, default:"title", maxlength: 50, required: true, trim:true },
    description: { type: String, default:"description", required: true, trim:true },
    user: { type: Schema.ObjectId, ref: 'User' },
    comments: [
        {
          body: { type: String, default: '', maxlength: 1000 },
          user: { type: Schema.ObjectId, ref: 'User' },
        //   postCommentedUserName:{ type: String, default: '', maxlength: 15},
          createdAt: { type: Date, default: Date.now }
        }
      ],
    createdAt: { type: Date, default: Date.now }
});


/**
 * Validations
 */

 postSchema.path('title').required(true, 'post title cannot be blank');
 postSchema.path('description').required(true, 'post description cannot be blank');


postSchema.methods = {
    addComment: function(user,comment){
        // console.log("USER: ",user,"COMMENT",comment);
        this.comments.push({
            body: comment.body,
            user: user._id
        });
        return this.save();
    },
    removeComment: function (postCommentId) {
        const index = this.comments.map(comment => comment.id).indexOf(postCommentId);
        if (~index) this.comments.splice(index, 1);
        else throw new Error('Comment not found');
        return this.save();
    },
    uploadAndSave: function (/*image*/) {
        const err = this.validateSync();
        if (err && err.toString()) throw new Error(err.toString());
        return this.save();
    }
}


postSchema.statics = {
    load: function (_id) {
        // console.log(_id);
        return this.findOne({ _id })
        .populate('user', 'name email username')
        .populate('comments.user')
        .exec();
    },
    list: function (options) {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
            .populate('user', 'name username')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(limit * page)
            .exec();
    }
};


mongoose.model("Post", postSchema);