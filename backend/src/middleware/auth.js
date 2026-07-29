import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - verify JWT token from cookies or Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first (more secure)
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  // Fallback to Authorization header for mobile apps or API clients
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * Authorize specific roles
 * Usage: authorize('admin', 'manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

/**
 * Generate both tokens and send as HTTP-only cookies
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Shorter expiry for access token
  const accessTokenOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  };

  // Set cookies
  res.cookie('accessToken', accessToken, accessTokenOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Also send tokens in response body for mobile apps
  res.status(statusCode).json({
    success: true,
    data: user.toJSON(),
    tokens: {
      accessToken,
      refreshToken,
    },
  });
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Legacy function for backward compatibility
 */
export const generateToken = generateAccessToken;
