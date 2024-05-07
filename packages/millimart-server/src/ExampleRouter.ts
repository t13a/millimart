import { ex } from "@millimart-kernel";
import express, { Router } from "express";

export const ExampleRouter = (): Router => {
  const router = express.Router();

  router.get("/", (_req, res) => {
    res.status(200).send(ex.greeting());
  });

  return router;
};
