import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { body, validationResult } from "express-validator";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.post(
    "/api/users",
    [
      body("username").isAlphanumeric().isLength({ min: 3, max: 20 }),
      body("password").isLength({ min: 8 }),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Proceed with user creation
    }
  );

  const httpServer = createServer(app);

  return httpServer;
}
