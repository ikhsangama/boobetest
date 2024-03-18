import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDb = async () => {
    mongoose.Promise = global.Promise;
    let dbConnectionURL;
    if (process.env.NODE_ENV === 'test') {
        mongoServer = await MongoMemoryServer.create();
        dbConnectionURL = mongoServer.getUri();
    } else {
        dbConnectionURL = process.env.DB_URI || "mongodb://boo:boo@localhost:27017/boo";
    }

    console.log('Connecting to DB at', dbConnectionURL);

    try {
        await mongoose.connect(dbConnectionURL, { authSource: 'admin' });
        console.log('Successfully connected to DB');
    } catch (error) {
        console.log('Error connecting to DB: ', error);
        process.exit(1);
    }
}

export default connectDb;