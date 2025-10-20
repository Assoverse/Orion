export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface OrionLogger {
  child(bindings: Record<string, unknown>): OrionLogger;
  trace(msg: string, data?: Record<string, unknown>): void;
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
  fatal(msg: string, data?: Record<string, unknown>): void;
}

const levelWeights: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const defaultLevel: LogLevel =
  (process.env.ORION_LOG_LEVEL as LogLevel) ?? "info";

const currentWeight = levelWeights[defaultLevel] ?? levelWeights.info;

const emit = (level: LogLevel, message: string, data?: Record<string, unknown>) => {
  if (levelWeights[level] < currentWeight) {
    return;
  }
  const payload = data ? { ...data } : undefined;
  const meta = payload ? JSON.stringify(payload) : "";
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  if (payload) {
    console.log(line, meta);
  } else {
    console.log(line);
  }
};

export const createLogger = (
  bindings: Record<string, unknown> = {}
): OrionLogger => {
  const base = { ...bindings };
  const format = (message: string): string => {
    if (!Object.keys(base).length) {
      return message;
    }
    return `${message} ${JSON.stringify(base)}`;
  };

  const log = (level: LogLevel, msg: string, data?: Record<string, unknown>) =>
    emit(level, format(msg), data);

  return {
    child(childBindings: Record<string, unknown>) {
      return createLogger({ ...base, ...childBindings });
    },
    trace: (msg, data) => log("trace", msg, data),
    debug: (msg, data) => log("debug", msg, data),
    info: (msg, data) => log("info", msg, data),
    warn: (msg, data) => log("warn", msg, data),
    error: (msg, data) => log("error", msg, data),
    fatal: (msg, data) => log("fatal", msg, data),
  };
};
