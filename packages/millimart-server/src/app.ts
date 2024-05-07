import express from "express";
import { ExampleRouter } from "./ExampleRouter";

const app = express();
const port = 3000;

app.use("/", ExampleRouter());

app.listen(port, () => {
  console.log(`MilliMart server listening on port ${port}`);
});
