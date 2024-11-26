import { Request, Response } from "express";

export function metodaNijeImplementirana(req: Request, res: Response) {
    res.status(501).json({ greska: `Metoda ${req.method} na ruti ${req.originalUrl} nije implementirana.` });
}
