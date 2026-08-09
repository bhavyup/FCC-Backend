export function authorizeModification(req, res, next) {
  const { id, role } = req.user;
  const { userId } = req.params;

  if (role === "parent" || (role === "child" && String(id) === String(userId))) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
