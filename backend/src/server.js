import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Backend server running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to boot the API:", error);
  process.exit(1);
});
