const mongoose = require('mongoose')
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
        golfers: {
            type: Number,
            default: 0
        },
        carts: {
            type: Number,
            default: 0
        },
        askPrice: {
            type: Number,
            required: true
        },
        increment: {
            type: Number,
            required: true
        },
        courseId: {
            type: String,
            required: true
        },
        courseName: {
            type: String,
            required: true
        },
        lastBidder: {
            type: String,
            required: true
        },
        lastBidderPrice: {
            type: Number
        },
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