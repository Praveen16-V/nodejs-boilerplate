import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import config from "@/config";
import database from "@/config/database";
import logger from "@/utils/logger";
import {
  helmetConfig,
  corsConfig,
  rateLimiter,
  mongoSanitizeConfig,
  xssConfig,
  hppConfig,
  compressionConfig,
  addSecurityHeaders,
  validateContentType,
  requestSizeLimit,
} from "@/middleware/security";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import routes from "@/routes";

const app = express();

app.use(helmetConfig);
app.use(corsConfig);
app.use(addSecurityHeaders);
app.use(compressionConfig);
app.use(mongoSanitizeConfig);
app.use(xssConfig);
app.use(hppConfig);
app.use(validateContentType);
app.use(requestSizeLimit);

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    }),
  );
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: MongoStore.create({
      mongoUrl: config.mongodbUri,
      collectionName: "sessions",
    }),
  }),
);

app.use(rateLimiter);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    console.log("🚀 Starting server...");
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔌 Port: ${config.port}`);

    console.log("🗄️  Connecting to MongoDB...");
    try {
      await database.connect();
      console.log("✅ MongoDB connected successfully!");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      console.log("⚠️  Server will continue without database connection");
    }

    const server = app.listen(config.port, () => {
      console.log(`🌐 Server running on http://localhost:${config.port}`);
      logger.info(
        `Server running on port ${config.port} in ${config.nodeEnv} mode`,
      );
    });

    const gracefulShutdown = (signal: string): void => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("🔌 HTTP server closed");
        logger.info("HTTP server closed");

        try {
          await database.disconnect();
          console.log("🗄️  Database connection closed");
          logger.info("Database connection closed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during database disconnection:", error);
          logger.error("Error during database disconnection:", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error("⏰ Forced shutdown due to timeout");
        logger.error("Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        logger.error("Unhandled Rejection at:", promise, "reason:", reason);
        gracefulShutdown("unhandledRejection");
      },
    );

    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}

export { startServer };
export default app;
