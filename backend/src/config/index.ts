import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "5000", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
  otp: {
    pepper: required("OTP_PEPPER"),
    ttlMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES ?? "5", 10),
  },
  fabric: {
    channel: process.env.FABRIC_CHANNEL ?? "votechannel",
    chaincode: process.env.FABRIC_CHAINCODE ?? "votechain",
    networkPath: process.env.FABRIC_NETWORK ?? "./blockchain/network",
    simulated: process.env.SIMULATED_BLOCKCHAIN !== "false",
  },
} as const;
