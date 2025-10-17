import { MongoClient } from 'mongodb';

const MONGO_URL = "mongodb://localhost:27017/";
const DATABASE_NAME = "nexus_2";
const COLLECTIONS = ["DB_1", "DB_2", "DB_3"];

export async function checkDatabase(){
    const mongoClient = new MongoClient(MONGO_URL);
    try {
        await mongoClient.connect();

        const db = mongoClient.db(DATABASE_NAME);
        const existingCollections = await db.listCollections({}, {nameOnly: true}).toArray();
        const existingCollectionNames = existingCollections.map(c => c.name);

        for (const colName of COLLECTIONS){
            if (!existingCollectionNames.includes(colName)){
                await db.createCollection(colName);
                const collection = db.collection(colName);
                await collection.createIndex({hashKey: 1}, {unique: true});
            }
        }
        return {
            message: "OK",
            status: 201
        };
        
    } catch (err){
        return {
            message: "Internal server error - Database was not created",
            stack: err.stack,
            status: 500
        };
    } finally {
        await mongoClient.close();
    }
};

export async function insertDatabase(collectionName, document){
    const mongoClient = new MongoClient(MONGO_URL);
    try {
        await mongoClient.connect();
        const databases = mongoClient.db(DATABASE_NAME);
        const collection = databases.collection(collectionName);

        const result = await collection.insertOne(document);
        return {
            message: "OK",
            status: 200
        };
    } catch (err) {
        return {
            message: "Internal server error : Database insertion error",
            stack: err.stack,
            status: 500
        };
    } finally {
        await mongoClient.close();
    }
}

export async function findDatabase(collectionName, key){
    const mongoClient = new MongoClient(MONGO_URL);
    try {
        await mongoClient.connect();
        const databases = mongoClient.db(DATABASE_NAME);
        const collection = databases.collection(collectionName);

        const result = await collection.findOne({hashValue: key});
        if (result){
            result.accessCount += 1;

            const updated = await collection.updateOne({ hashValue: key }, {
                $set: {
                    accessCount: result.accessCount
                }
            })
            if (updated.matchedCount > 0){
                return {
                    message: "OK",
                    status: 200,
                    body: result
                };
            } else {
                return {
                    message: "Internal server error: Document found, but not updated",
                    status: 500,
                };
            }
        } else {
            return {
                message: "Document not found",
                status: 404
            };
        }
        
    } catch (err){
        return {
            message: "Database search error",
            stack: err.stack,
            status: 500
        };
    } finally {
        await mongoClient.close();
    }
}