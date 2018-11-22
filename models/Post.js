const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we are storing the name and avatar here as well
// if the user deletes their account we still want to show their comments and picture
//also want to track who is liking the post so that we only allow one like/dislike per user
//we are allowing users to comment on posts

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  name: String,
  avatar: String,
  date: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true
      },
      name: String,
      avatar: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
