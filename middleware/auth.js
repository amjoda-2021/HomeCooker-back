const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log(req.headers.authorization);
  console.log(req.body, "caca");
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    const userId = decodedToken.userId;

    console.log(token, decodedToken, userId, "CACACACAC");
    req.auth = { userId };
    if (req.body.userId && req.body.userId !== userId) {
      res.status(401).json({
        error: "Invalid user ID",
      });
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: "Invalid request!",
    });
  }
};
