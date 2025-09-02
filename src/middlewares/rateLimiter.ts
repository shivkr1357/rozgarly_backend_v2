import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(env.RATE_LIMIT_WINDOW_MS / 1000)
    });
  }
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

// Moderate rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many API requests, please try again later',
    error: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many API requests, please try again later',
      error: 'API_RATE_LIMIT_EXCEEDED',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

// Strict rate limiter for job ingestion
export const ingestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 ingestion requests per hour
  message: {
    success: false,
    message: 'Too many ingestion requests, please try again later',
    error: 'INGESTION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many ingestion requests, please try again later',
      error: 'INGESTION_RATE_LIMIT_EXCEEDED',
      retryAfter: 3600 // 1 hour in seconds
    });
  }
});

// Socket.io rate limiter
export const socketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 socket events per minute
  message: {
    success: false,
    message: 'Too many socket events, please slow down',
    error: 'SOCKET_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many socket events, please slow down',
      error: 'SOCKET_RATE_LIMIT_EXCEEDED',
      retryAfter: 60 // 1 minute in seconds
    });
  }
});
