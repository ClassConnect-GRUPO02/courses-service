// middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY_HEX = process.env.SECRET_KEY as string; // clave pública del servicio de usuarios
const SECRET_KEY = Buffer.from(SECRET_KEY_HEX, "hex");

export interface AuthenticatedRequest extends Request {
  user?: {
    Id: string;
    userType: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!SECRET_KEY) {
      res.status(500).json({ message: "Internal server error: missing SECRET_KEY" });
      return;
    }
    const payload = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] }) as { id: string; userType: string };
    req.user = {
      Id: payload.id,
      userType: payload.userType,
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token", err });
  }
}

/*
export function authorizeRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

function authorizeProfessor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ message: 'Access denied: Professors only' });
  }
  next();
}
*/
