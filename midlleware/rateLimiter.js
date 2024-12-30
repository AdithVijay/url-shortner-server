const rateLimiter = (req, res, next) => {
    const { url, user } = req.body; // Extract URL and user from the request body
    const redisClient = req.app.locals.redisClient; // Access Redis client from app.locals
  
    const key = `rate-limit:${url}:${user}`; // Create a unique key for this user and URL
    const limit = 10; // Maximum number of requests
    const window = 30 * 60; // Time window in seconds (30 minutes)
  
    redisClient
      .get(key)
      .then((data) => {
        const current = data ? parseInt(data) : 0;
  
        if (current >= limit) {
          return res.status(429).json({
            message: "Too many requests. Please try again later.",
          });
        }
  
        console.log("Hit occurred")
  
        // Increment the request count and set expiration if it's a new key
        redisClient
          .multi()
          .incr(key)
          .expire(key, window)
          .exec();
  
        next();
      })
      .catch((err) => {
        console.error("Redis error:", err);
        res.status(500).json({ message: "Internal server error" });
      });
  };
  
  module.exports = { rateLimiter };
  