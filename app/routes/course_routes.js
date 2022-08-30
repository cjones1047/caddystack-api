// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Course = require('../models/course.js')

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

// SHOW
router.get('/course/:courseId/:userId', (req, res, next) => {
	// req.params.courseId will be set based on the `:courseId` in the route
	Course.findOne().and([{ courseId: req.params.courseId}, { owner: req.params.userId}])
		.then(handle404)
        // findOne first sees if the course exists for the current user
		// if `findOne` is succesful, respond with 200 and "course" JSON
		.then((course) => res.status(200).json({ course: course.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// INDEX
router.get('/course', requireToken, (req, res, next) => {
	Course.find({owner: req.user.id}).sort({ name: 'asc' })
		.then((courses) => {
			// `courses` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return courses.map((course) => course.toObject())
		})
		// respond with status 200 and JSON of the courses
		.then((courses) => res.status(200).json({ courses: courses }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
router.post('/course', requireToken, (req, res, next) => {
	// set owner of new course to be current user
	req.body.course.owner = req.user.id

	Course.create(req.body.course)
		// respond to succesful `create` with status 201 and JSON of new "course"
		.then((course) => {
			res.status(201).json({ course: course.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
router.patch('/course/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.course.owner

	Course.findById(req.params.id)
		.then(handle404)
		.then((course) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, course)

			// pass the result of Mongoose's `.update` to the next `.then`
			return course.updateOne(req.body.course)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DELETE
router.delete('/course/:courseId', requireToken, (req, res, next) => {
    const userId = req.user.id
	Course.deleteOne().and([{ courseId: req.params.courseId}, { owner: userId}])
		.then(handle404)
		// .then((course) => {
		// 	// throw an error if current user doesn't own `course`
		// 	// requireOwnership(req, course)
		// 	// delete the course ONLY IF the above didn't throw
		// 	course.deleteOne(course._id)
		// })
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
