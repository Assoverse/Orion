import crypto from "node:crypto";

export const generateId = (prefix = "orion"): string => {
  const random = crypto.randomBytes(4).toString("hex");
  return `${prefix}-${random}`;
};
