const axios = require('axios')
const {MongoClient, ServerApiVersion} = require("mongodb");
const uri = "mongodb+srv://barstool-user:3pJ3SueuhZ5BgieK@barstool-cluster.c2ibypv.mongodb.net/?retryWrites=true&w=majority";


const NBA_URL = "https://chumley.barstoolsports.com/dev/data/games/6c974274-4bfc-4af8-a9c4-8b926637ba74.json";
const MLB_URL = "https://chumley.barstoolsports.com/dev/data/games/eed38457-db28-4658-ae4f-4d4d38e9e212.json"


const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

/***
 * Connect to DB and prime it
 * @returns {Promise<void>}
 */
exports.connectToDB = async () => {

    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    await client.db('barstool-widget').collection('sports-data').createIndex({"name": 1}, {unique: true})
    primeDB()


}

/***
 * Get new data from the feed and update it in the DB , update
 * contains new time as well
 * @param sportName the sport to fetch
 * @returns {Promise<ModifyResult<Document>>}
 */
const updateDB = async (sportName) => {
    const DB = client.db('barstool-widget')
    const collection = DB.collection('sports-data')

    return axios.get(sportName === 'mlb' ? MLB_URL : NBA_URL)
        .then(result => {
                return collection.findOneAndUpdate(
                    {name: sportName},
                    {$set: {data: result['data'], time: new Date()}},
                    {upsert: true}
                )

            }
        );


}

/***
 * Upon DB startup make initial calls and set the latest data
 */
const primeDB = () => {

    axios.get(MLB_URL)
        .then(result => {
                let json = result['data']
                client.db('barstool-widget').collection('sports-data').updateOne(
                    {name: 'mlb'},
                    {$set: {name: 'mlb', data: json, time: new Date()}},
                    {upsert: true}
                )
            }
        );

    axios.get(NBA_URL)
        .then(result => {
                let json = result['data']
                client.db('barstool-widget').collection('sports-data').updateOne(
                    {name: 'nba'},
                    {$set: {name: 'nba', data: json, time: new Date()}},
                    {upsert: true}
                )
            }
        );
}

/***
 * Compare the time of the last DB update with when the new request has been made
 * @param sportName
 * @returns {Promise<{seconds: number, lastUpdate: Document & {_id: InferIdType<Document>}}>}
 */
const compareTime = async (sportName) => {
    let lastUpdate = await client.db('barstool-widget').collection('sports-data').findOne({name: sportName})

    //compare
    const lastUpdateTime = lastUpdate.time;
    const now = new Date()
    const seconds = (now.getTime() - lastUpdateTime.getTime()) / 1000;
    return {seconds: seconds, lastUpdate: lastUpdate};

}

/***
 * Either get data from the DB if it has been less than 15 seconds since entry in DB or fetch
 * new data from resource and udpate DB with that latest copy
 * @param sportName
 * @returns {Promise<*>}
 */
exports.getOrFetch = async (sportName) => {
    let time = await compareTime(sportName);
    if (time.seconds > 15) {
        let newData = await updateDB(sportName)
        return newData.value.data
    } else {
        return time.lastUpdate.data
    }

}





