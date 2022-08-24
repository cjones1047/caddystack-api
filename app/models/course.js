const mongoose = require('mongoose')
// const commentSchema = require('./comment')
// const likeSchema = require('./like')
const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phoneNumber: String,
        website: String,
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
module.exports = mongoose.model('Course', courseSchema)