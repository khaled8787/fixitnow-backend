import dotenv from "dotenv";
dotenv.config();

import { AddressInfo } from "net";
import app from "./app";

const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => {
  const address = server.address() as AddressInfo;
  console.log(
    `🚀 FixItNow Backend Server is running on http://localhost:${address.port}`
  );
});

const gracefulShutdown = (signal: string): void => {
  console.log(`${signal} received. Shutting down server gracefully...`);

  server.close((error?: Error) => {
    if (error) {
      console.error("Error while closing the server:", error);
      process.exit(1);
    }

    console.log("Server closed successfully.");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);

  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);

  server.close(() => {
    process.exit(1);
  });
});