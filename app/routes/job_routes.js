const express = require('express')
const passport = require('passport')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

const Job = require('../models/job')


// INDEX
// displays a list of jobs applied to
// GET /applied
router.get('/applied', requireToken, (req, res, next) => {
	Job.find()
	.populate('owner')
		.then((jobs) => {
			// `jobs` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to apply `.toObject` to each one
			return jobs.map((job) => job.toObject())
		})
		// respond with status 200 and JSON of the jobs
		.then((jobs) => res.status(200).json({ jobs: jobs }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// displays the details of a job applied to 
// GET /applied/<insert ID here>
router.get('/applied/:id', requireToken, (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Job.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "job" JSON
		.then((job) => res.status(200).json({ job: job.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /applied
router.post('/applied', requireToken, (req, res, next) => {
	// set owner of new job to be current user
	req.body.job.owner = req.user.id

	Job.create(req.body.job)
		// respond to succesful `create` with status 201 and JSON of new "job"
		.then((job) => {
			res.status(201).json({ job: job.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /applied/<insert id here>
router.patch('/applied/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.example.owner

	Job.findById(req.params.id)
		.then(handle404)
		.then((job) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, job)

			// pass the result of Mongoose's `.update` to the next `.then`
			return job.updateOne(req.body.job)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /applied/<insert id here>
router.delete('/applied/:id', requireToken, (req, res, next) => {
	Job.findById(req.params.id)
		.then(handle404)
		.then((job) => {
			// throw an error if current user doesn't own `job`
			requireOwnership(req, job)
			// delete the job ONLY IF the above didn't throw
			job.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
