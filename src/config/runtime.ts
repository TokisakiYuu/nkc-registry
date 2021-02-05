import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getLogger } from "log4js";

const logger = getLogger();
logger.level = "debug";

const envFile = path.resolve(__dirname, "../../.env");
const envExampleFile = path.resolve(__dirname, "../../.env.example");

if(fs.existsSync(envFile)) {
  logger.info("Using .env file to supply config environment variables");
  dotenv.config({ path: envFile });
} else {
  logger.warn("Using .env.example file to supply config environment variables");
  dotenv.config({ path: envExampleFile });
}

/**
 * 从环境变量中获取参数值
 * @param name 参数名
 * @example
 * ```typescript
 * // eg. you want get "SERVICE_NAME" from .env
 * runtime.get("SERVICE_NAME")
 * // or
 * runtime.get("service_name")
 * // or
 * runtime.get("service name")
 * ```
 */
export function get(name: string): string {
  if(name in process.env) {
    return process.env[name];
  }

  const lowCase = name.toUpperCase();
  if(lowCase in process.env) {
    return process.env[lowCase];
  }

  const sentenceCase = name.toUpperCase().split(/\s+/).join("_");
  if(sentenceCase in process.env) {
    return process.env[sentenceCase];
  }
}

/**
 * 是否是以开发模式启动的
 */
export const isDevelopment = process.env.NODE_ENV !== "production";
