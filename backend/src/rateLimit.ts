import rateLimit from "express-rate-limit"

export const clerkRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: any) => {

    if (req.auth?.userId) {
      return `user_${req.auth.userId}`
    }
    return req.ip
  },

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many requests, please slow down",
    })
  },
})
