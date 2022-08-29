// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Teetime = require('../models/teetime.js')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
router.get('/all-my-teetimes', requireToken, (req, res, next) => {
	Teetime.find({owner: req.user.id}).sort({ date: 'asc', courseName: 'desc' })
		.then((teetimes) => {
			// `teetimes` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return teetimes.map((teetime) => teetime.toObject())
		})
		// respond with status 200 and JSON of the teetimes
		.then((teetimes) => res.status(200).json({ teetimes: teetimes }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// INDEX
router.get('/teetime/:courseId', (req, res, next) => {
	// req.params.courseId will be set based on the `:courseId` in the route
	Teetime.find({courseId: req.params.courseId}).sort({date: 'asc'})
		.then(handle404)
        // findOne first sees if the course exists for the current user
		// if `findOne` is succesful, respond with 200 and "teetime" JSON
        .then((teetimes) => {
			// `teetimes` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return teetimes.map((teetime) => teetime.toObject())
		})
		.then((teetimes) => res.status(200).json({ teetimes: teetimes }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
router.post('/teetime', requireToken, (req, res, next) => {
	// set owner of new course to be current user
	req.body.teetime.owner = req.user.id

	Teetime.create(req.body.teetime)
		// respond to succesful `create` with status 201 and JSON of new "teetime"
		.then((teetime) => {
			res.status(201).json({ teetime: teetime.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
router.patch('/teetime/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new owner, the following prevents that by deleting that key/value pair
	    // delete req.body.teetime.owner
    // however, we want a teetime to change owners when one owner accepts a current bid, so we're editing this ^^^ out 

	Teetime.findById(req.params.id)
		.then(handle404)
		.then((teetime) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			    // requireOwnership(req, teetime)

			// pass the result of Mongoose's `.update` to the next `.then`
			return teetime.updateOne(req.body.teetime)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DELETE
router.delete('/teetime/:id', requireToken, (req, res, next) => {
	Teetime.findById(req.params.id)
		.then(handle404)
		.then((teetime) => {
			requireOwnership(req, teetime)
			teetime.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
