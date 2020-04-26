const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
const shortid = require('shortid')
const Promise = require('bluebird')
const DAO = require('./dao')
const Notes = require('./notes')

// define the Express app
const app = express()
const port = process.env.PORT || 3000

// Open database connection
const dao = new DAO('./database.sqlite3')
const notesRepo = new Notes(dao)
notesRepo.createTable()
    .catch((err) => {
        console.log('Error: ')
        console.log(JSON.stringify(err))
    })

// Enhance your app security with Helmet
app.use(helmet())

// Use bodyParser to parse application/json content-type
app.use(bodyParser.json())

// Enable all CORS requests
app.use(cors())

// Log HTTP requests
app.use(morgan('combined'))

// Adding authentication middleware
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AUTH0_DOMAIN + '/.well-known/jwks.json'
    }),

    // Validate the audience and the issuer.
    audience: process.env.AUTH0_CLIENT_ID,
    issuer: process.env.AUTH0_DOMAIN + '/',
    algorithms: ['RS256']
})


// Gretting 
app.get('/', (req, res) => {
    res.send('hello moon')
})


// Insert a new note
app.post('/', checkJwt, (req, res) => {
    const new_note = req.body
    if(new_note.id === '') {
        new_note.id = shortid.generate()
        notesRepo.create(new_note)
            .then( (rst) => {
                res.status(200).send({ 'id': new_note['id'] })
            })
            .catch( (err) => {
                console.log('ERROR - / (new)')
                console.log(err)
                res.sendStatus(500)
            })
    } else {
        notesRepo.update(new_note)
            .then( (rst) => {
                res.status(200).send({ 'id':new_note['id'] })
            })
            .catch( (err) => {
                console.log('ERROR - / (update)')
                console.log(err)
                res.sendStatus(500)
            })
    }
})

// Get all notes for author
app.get('/author', checkJwt, (req, res) => {
    let author = req.user === undefined ? null : req.user.nickname
    notesRepo.getByAuthor(author)
        .then( (rst) => {
			rst = rst.map( (x) => {
				delete x.content
				return(x)
			} )
            res.send(rst)
        })
        .catch( (err) => {
            console.log('ERROR - /author')
            console.log(err)
            res.sendStatus(500)
        } )
})

// Get a specific note from an author
app.get('/note/:id', checkJwt, (req, res) => {
    let author = req.user === undefined ? null : req.user.nickname
    notesRepo.getByIdAndAuthor(req.params.id, author)
        .then( (rst) => {
            res.send(rst)
        })
        .catch( (err) => {
            console.log('ERROR - /note/:id')
            console.log(err)
            res.sendStatus(500)
        })
})

// Delete a specific note
app.delete('/delete/:id', checkJwt, (req, res) => {
    let author = req.user === undefined ? null : req.user.nickname
    notesRepo.delete(req.params.id, author)
        .then( (rst) => {
            res.status(200).send(rst)
        })
        .catch( (err) => {
            console.log('ERROR - /delete/:id')
            console.log(err)
            res.sendStatus(500)
        } )
})

// Get a public note using its short ID
app.get('/public/:id', (req, res) => {
    notesRepo.getByIdPublic(req.params.id, false)
        .then( (rst) => {
            if( rst === undefined || !rst.public ) {
                res.send([])
            } else {
                res.send(rst)
            }
        })
        .catch( (err) => {
            console.log('ERROR - /note/:id')
            console.log(err)
            res.sendStatus(500)
        })
})



app.listen(port, () => { console.log(`Listening on port ${port}`) })