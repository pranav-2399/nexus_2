import express from 'express'
import { createHashKey, modulo3, isValidURL } from './utils.js'
import { checkDatabase, findDatabase, insertDatabase } from './database.js';

const app = express();

const DOMAIN = 'http://localhost:'
const PORT = 3000;

app.use(express.json());

app.get("/get_short_URL", async (req, res, next) => {
    const data = req.body.URL;

    if (data === undefined){
        const error = new Error("Inappropriate request: URL cannot be undefined");
        error.status = 400;
        next(error);
    } else if (!isValidURL(data)){
        const error = new Error("Invalid format: URL is not valid");
        error.status = 400;
        next(error);
    } else {
        const hashKey = createHashKey();
        const document = {
            hashValue: hashKey,
            originalURL: data,
            accessCount: 0
        };

        const database = "".concat("DB_", modulo3(hashKey));
        const response = await insertDatabase(database, document);

        const shorter = "".concat(DOMAIN, PORT, "/", hashKey)
        if (response.status === 200){
            res.status(response.status).send({
                message: response.message,
                status: response.status,
                shortURL: shorter
            });
        } else {
            res.status(response.status).send(response);
        }
    }
});

app.get("/:hash", async (req, res, next) => {
    const hashKey = req.params.hash
    if (hashKey.length !== 7){
        const error = new Error("Invalid short URL. Please try again");
        error.status = 400;
        next(error);
    } else {
        const database = "".concat("DB_", modulo3(hashKey));
        const result = await findDatabase(database, hashKey);

        if (result.status === 200){
            res.status(result.status).send({
                message: result.message,
                status: result.status,
                body: {
                    originalURL: result.body.originalURL
                }
            })
        } else {
            res.status(result.status).send(result);
        }
    }
})

app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        message: err.message,
        status: err.status || 500
    })
})

app.listen(PORT, () => {
    checkDatabase();
    console.log(`Testing server at ${DOMAIN}${PORT}`)
});