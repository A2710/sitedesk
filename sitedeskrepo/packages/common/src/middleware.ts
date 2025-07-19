import { Request, Response, NextFunction } from "express";
import jwt, { Jwt } from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import { JwtPayload } from "./utils"; // Adjust this import path to your actual types location


// Extend Express Request to include user info for typescript

declare module "express" {
    interface Request {
        user ?: JwtPayload;
        customer ?: JwtPayload;
        organizationId?: number;
    }
}

//=====================================================================================================//

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  // Accept JWT from httpOnly cookie OR Authorization header (for widgets)
  const token =
    req.cookies?.jwt ||
    (req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.split(" ")[1]);

  if (!token) {
    res.status(401).json({ message: "Authentication Required!" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Role-based branching
    if (payload.role === "ADMIN" || payload.role === "AGENT") {
      req.user = payload;
      next();
    } else if (payload.role === "CUSTOMER") {
      req.customer = payload;
      next();
    } else {
      res.status(401).json({ message: "Invalid token role" });
      return;
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
}

//=====================================================================================================//

export function requireRole(...roles: JwtPayload["role"][]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    // req.user is set by authenticateJWT
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: Insufficient role" });
      return;
    }
    next();
  };
}

//=====================================================================================================//

export function requireCustomer(req: Request, res: Response, next: NextFunction): void {
  if (!req.customer) {
    res.status(401).json({ message: "Not authenticated as customer" });
    return;
  }
  next();
}

//=====================================================================================================//

declare module "express" {
  interface Request {
    
  }
}

export async function resolveOrgFromDomain(req: Request, res: Response, next: NextFunction) {
  const rawOrigin = req.headers.origin || req.headers.referer;
  if (!rawOrigin) {
    res.status(400).json({ message: "Missing Origin or Referer header." });
    return;
  }
  // Remove any protocol and any path, and lowercase for DB match
  const domain = rawOrigin
    .replace(/^[a-zA-Z]+:\/\//, '')
    .replace(/\/.*$/, '')
    .toLowerCase();

  try {
    const orgDomain = await prismaClient.orgDomain.findUnique({
      where: { domain }
    });
    if (!orgDomain) {
      res.status(400).json({ message: "Unrecognized domain." });
      return;
    }
    req.organizationId = orgDomain.organizationId;
    next();
  } catch (error) {
    console.error("Error in resolveOrgFromDomain:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}