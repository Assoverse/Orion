import pino from "pino";
import { OrionLogger } from "@orion/shared";

const base = pino({
  level: process.env.ORION_LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { translateTime: true, colorize: true },
        }
      : undefined,
});

const wrap = (instance: pino.Logger): OrionLogger => ({
  child(bindings) {
    return wrap(instance.child(bindings));
  },
  trace(message, data) {
    instance.trace(data ?? {}, message);
  },
  debug(message, data) {
    instance.debug(data ?? {}, message);
  },
  info(message, data) {
    instance.info(data ?? {}, message);
  },
  warn(message, data) {
    instance.warn(data ?? {}, message);
  },
  error(message, data) {
    instance.error(data ?? {}, message);
  },
  fatal(message, data) {
    instance.fatal(data ?? {}, message);
  },
});

export const logger = wrap(base);
