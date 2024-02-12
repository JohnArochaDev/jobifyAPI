const mongoose = require('mongoose')

const trackerSchema = require('./tracker')

const jobSchema = new mongoose.Schema(
	{
		img: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		company: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		details: {
			type: String,
			required: true,
		},
		tracker: [trackerSchema],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Job', jobSchema)