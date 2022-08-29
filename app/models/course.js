const mongoose = require('mongoose')
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
        hours: Array,
        note: String,
        courseId: {
            type: String,
            required: true
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
module.exports = mongoose.model('Course', courseSchema)