import rateLimit, { ipKeyGenerator } from "express-rate-limit"

export const clerkRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: any) => {
    const ipKey = ipKeyGenerator(req)
    if (req.auth()?.userId) {
      return `user_${req.auth.userId}`
    }
    return ipKey
  },

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many requests, please slow down",
    })
  },
})
