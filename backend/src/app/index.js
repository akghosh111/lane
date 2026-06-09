import cors from "cors";
import express from "express";
import { auth } from "../lib/auth.js";
import { toNodeHandler } from "better-auth/node";


export function createApplication() {
    const app = express();

    app.use(express.json());


    app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"], // Added common frontend ports
        methods: ["GET", "POST", "PUT", "DELETE"], 
        credentials: true,
    })
    );

    const betterAuthHandler = toNodeHandler(auth);
    
    app.all(/^\/api\/auth(?:\/.*)?$/, (req, res) => betterAuthHandler(req, res));

    app.get("/health", (req, res) => {
        return res.json({message: "This server is healthy"});
    })


    return app;
}