import express from "express";


export function createApplication() {
    const app = express();

    app.use(express.json());


    app.get("/health", (req, res) => {
        return res.json({message: "This server is healthy"});
    })


    return app;
}