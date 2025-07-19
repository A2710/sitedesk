import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CUSTOMER";
  organizationId: number;
  // add more fields if needed
}


export const generateToken = (payload: JwtPayload, secretString: string = ""):string => {
    
    if (!secretString) {
      throw new Error("JWT_SECRET is not defined");
    }

    const options: jwt.SignOptions = {
      expiresIn: payload.role === "CUSTOMER" ? "1h" : "7d",
      algorithm: "HS256"
    }

    const token = jwt.sign(payload, secretString as jwt.Secret, options);

    return token;
}