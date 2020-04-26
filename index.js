/*const http = require('http')
const port = process.env.PORT || 3000

const winston = require('winston');

// create logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //new winston.transports.File({ filename: 'snotes.error.log', level: 'error' }),
        new winston.transports.File({ filename: 'snotes.all.log' })
    ]
});

const server = http.createServer(function (req, res) {
    logger.info('Incoming')
    res.writeHead(200, {'Content-Type': 'text/html'}) // http header
    var url = req.url
    logger.info('Incoming - ', url)
    logger.info('Incoming - ', req)
    if(url ==='/about'){
        res.write('<h1>about us page<h1>'); //write a response
        res.end(); //end the response
    } else if(url ==='/contact') {
        res.write('<h1>contact us page<h1>'); //write a response
        res.end(); //end the response
    } else {
        res.write('<h1>Hello World!<h1>'); //write a response
        res.end(); //end the response
    }
})


server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})*/

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

// enhance your app security with Helmet
app.use(helmet())

// use bodyParser to parse application/json content-type
app.use(bodyParser.json())

// enable all CORS requests
app.use(cors())

// log HTTP requests
app.use(morgan('combined'))


app.get('/', (req, res) => {
    res.send('hello moon')
})
app.get('/about', (req, res) => {
    res.send('<h1>about</h1>')
})
app.get('/contact', (req, res) => {
    res.send('<h1>contact</h1>')
})