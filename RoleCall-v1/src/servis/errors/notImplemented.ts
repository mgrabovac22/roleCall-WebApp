import { Request, Response } from "express";

export function metodaNijeImplementirana(req: Request, res: Response) {
    res.status(501).json({ greska: `Zabranjena metoda ${req.method} - ${req.originalUrl}.` });
}
