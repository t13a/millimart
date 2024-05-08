import express, { Router } from "express";
import { ex } from "millimart-kernel";

export const ExampleRouter = (): Router => {
  const router = express.Router();

  router.get("/", (_req, res) => {
    res.status(200).send(ex.greeting());
  });

  return router;
};
