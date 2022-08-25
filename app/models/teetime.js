const mongoose = require('mongoose')
// const commentSchema = require('./comment')
// const likeSchema = require('./like')
const teetimeSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: Date,
            required: true
        },
        golfers: Number,
        carts: Number,
        courseId: {
            type: String,
            required: true
        },
        // comments:[commentSchema],
        owner:{
            type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
        }
    },
    {
		timestamps: true,
	}
)
module.exports = mongoose.model('Teetime', teetimeSchema)