const express = require('express')
const app = express()
const port = 5000
const axios = require('axios')
const cors = require("cors");
const morgan = require('morgan')
const utils = require('./utils')
const {getOrFetch} = require("./utils");


utils.connectToDB()


app.use(cors())
app.use(express.json());
app.use(morgan('dev'))

/***
 * Endpoint for NBA
 */
app.get('/nba', (req, res, next) => {
    getOrFetch('nba').then(response => {
            res.status(200).send({
                message: response
            })
        }
    ).catch(err=> console.log(`Error from NBA endpoint ${err}`))


})

/***
 * Endpoint for MLB
 */
app.get('/mlb', (req, res, next) => {
    getOrFetch('mlb').then(response => {
            res.status(200).send({
                message: response
            })
        }
    ).catch(err=> console.log(`Error from MLB endpoint ${err}`))

})


app.listen(port, () => {
    console.log(`Backend is listening on port ${port}`)
})