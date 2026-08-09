import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
  findById,
} from "../utils/db.js";

const router = express.Router();

router.use(authenticate);

router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const watchlist = getWatchlist(Number(userId));

  if (watchlist === null) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(watchlist);
});

router.post("/:userId/movies", authorizeModification, (req, res) => {
  const { userId } = req.params;

  if (!findById(Number(userId))) {
    return res.status(404).json({ error: "User not found" });
  }

  const movie = addMovie(Number(userId), req.body);

  return res.status(201).json(movie);
});

router.put(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const { userId, movieId } = req.params;

    if (!findById(Number(userId))) {
      return res.status(404).json({ error: "User not found" });
    }

    const movie = updateMovie(
      Number(userId),
      Number(movieId),
      req.body,
    );

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    return res.status(200).json(movie);
  },
);

router.delete(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const { userId, movieId } = req.params;

    if (!findById(Number(userId))) {
      return res.status(404).json({ error: "User not found" });
    }

    const deleted = deleteMovie(
      Number(userId),
      Number(movieId),
    );

    if (!deleted) {
      return res.status(404).json({ error: "Movie not found" });
    }

    return res.status(200).json({
      message: "Movie deleted successfully",
    });
  },
);

export default router;
