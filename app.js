import express from 'express';
import pkg from 'body-parser';
import OpenApiValidator from 'express-openapi-validator';
import path from 'path';
import connectDb from './configs/db.js';
import profileRoutes from './routes/profile.js';
import commentRoutes from './routes/comment.js';

const app = express();
const apiSpec = path.join(process.cwd(), './docs/openapi.yaml');
const { json } = pkg;

// set up middleware
function setupMiddleware(app) {
    // set the view engine to EJS
    app.set('view engine', 'ejs');
    app.use(json());
    // Use Express OpenAPI Validator middleware
    app.use(
        OpenApiValidator.middleware({
            apiSpec,
            validateRequests: true,
            validateResponses: false
        })
    );
    // Middleware to handle validation errors
    app.use((err, req, res, next) => {
        console.log({err}, 'Error handling middleware')
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors
        });
    });
}

// set up routes
function setupRoutes(app) {
    app.use('/profile', profileRoutes);
    app.use('/comment', commentRoutes);
}

// start the server and connect to the DB
async function startServer() {
    const env = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || 3000;
    console.log({env, port})
    try {
        const server = app.listen(port);
        if (env !== 'test') {
            await connectDb();
            console.log('Server and DB connection successfully started');
        }
        return server
    } catch (error) {
        console.error('Failed to connect to the DB:', error);
        console.error('Server or DB connection start failed, closing server');
        server.close(() => {
            console.log('Server closed');
        });
    }
}

let server;
(async function run() {
    setupMiddleware(app);
    setupRoutes(app);
    server = await startServer();
})();

export {
    app, server
}