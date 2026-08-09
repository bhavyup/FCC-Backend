import express from "express";
import path from "path";
import { inputCleaner, inputValidator } from "./middleware.js";

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/form");
});

app.get("/form", (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "public", "index.html"));
});

app.post(
  "/submit",
  inputCleaner,
  inputValidator,
  (req, res) => {
    res.json({
      username: req.body.username,
      comment: req.body.comment
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
