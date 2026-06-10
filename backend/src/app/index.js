import cors from "cors";
import express from "express";
import { auth } from "../lib/auth.js";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { workspaceRouter } from "./modules/workspace/routes.js";
import { boardRouter } from "./modules/board/routes.js";
import { listRouter } from "./modules/list/routes.js";
import { cardRouter } from "./modules/card/routes.js";


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
    });

    app.get("/api/me", async (req, res) => {
        const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
        });
        return res.json(session);
    });

    app.use("/api/workspaces", workspaceRouter);
    app.use("/api/boards", boardRouter);
    app.use("/api/lists", listRouter);
    app.use("/api/cards", cardRouter);


    return app;
}