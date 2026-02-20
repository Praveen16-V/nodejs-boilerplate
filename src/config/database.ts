import mongoose from "mongoose";
import config from "./index";

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri =
        config.nodeEnv === "test" ? config.mongodbTestUri : config.mongodbUri;

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });

      mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error; // Throw instead of exit so server can handle it
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }

  public getConnection(): typeof mongoose {
    return mongoose;
  }
}

export default Database.getInstance();
