const cassandra = require("cassandra-driver");
require("dotenv").config();

const client = new cassandra.Client({
    contactPoints: [process.env.DB_HOST || "127.0.0.1"],
    protocolOptions: {
        port: Number(process.env.DB_PORT || 9042)
    },
    localDataCenter: process.env.DB_DATACENTER || "datacenter1",
    keyspace: process.env.DB_KEYSPACE || "dynamo"
});

async function connectDB() {
    await client.connect();
    console.log("Connected to ScyllaDB");
}

async function closeDB() {
    await client.shutdown();
}

module.exports = { client, connectDB, closeDB };