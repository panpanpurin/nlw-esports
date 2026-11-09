import express from "express";
import cors from "cors";
import { gamesRoutes } from "./routes/games.routes";
import { adsRoutes } from "./routes/ads.routes";

export const app = express();

app.use(express.json());
app.use(cors());

app.use("/games", gamesRoutes);
app.use("/ads", adsRoutes);
