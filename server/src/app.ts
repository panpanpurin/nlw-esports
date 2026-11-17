import express from 'express';
import cors from 'cors';
import { gamesRoutes } from './routes/games.routes';
import { adsRoutes } from './routes/ads.routes';
import { errorHandler } from './middlewares/error-handler';
import { parseTrustProxy } from './utils/parse-trust-proxy';

export const app = express();

app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

app.use(express.json());
app.use(cors());

app.use('/games', gamesRoutes);
app.use('/ads', adsRoutes);

app.use(errorHandler);
