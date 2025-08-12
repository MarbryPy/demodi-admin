import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseStorage } from "./supabase";
import { insertCarteSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend the session data to include our custom properties
declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'demodi-card-manager-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    },
    name: 'DEMODI_ADMIN'
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.authenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.FORM_PASSWORD;

      if (!adminPassword) {
        return res.status(500).json({ message: "Server configuration error" });
      }

      if (password !== adminPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      req.session.authenticated = true;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    res.json({ authenticated: !!req.session.authenticated });
  });

  // Create carte
  app.post("/api/cards", requireAuth, async (req, res) => {
    try {
      // Whitelist only allowed fields
      const allowedFields = {
        titre: req.body.titre,
        effet: req.body.effet,
        categorie: req.body.categorie,
        alignement: req.body.alignement,
        visibilite_defaut: req.body.visibilite_defaut,
        rarete: req.body.rarete,
        comportement_revelation: req.body.comportement_revelation,
        actif: req.body.actif !== undefined ? req.body.actif : true,
      };

      // Enforce rarete = null if categorie = 'special'
      if (allowedFields.categorie === 'special') {
        allowedFields.rarete = null;
      }

      const carteData = insertCarteSchema.parse(allowedFields);
      
      // Use Supabase if credentials are available, otherwise use in-memory storage
      const carte = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
        ? await supabaseStorage.createCarte(carteData)
        : await storage.createCarte(carteData);
        
      res.json({ ok: true, card: carte });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get recent cartes
  app.get("/api/cards/recent", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const cartes = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
        ? await supabaseStorage.getRecentCartes(limit)
        : await storage.getRecentCartes(limit);
      res.json(cartes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all cartes
  app.get("/api/cards", requireAuth, async (req, res) => {
    try {
      const cartes = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
        ? await supabaseStorage.getAllCartes()
        : await storage.getAllCartes();
      res.json(cartes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get carte by ID
  app.get("/api/cards/:id", requireAuth, async (req, res) => {
    try {
      const carte = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
        ? await supabaseStorage.getCarteById(req.params.id)
        : await storage.getCarteById(req.params.id);
      if (!carte) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.json(carte);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
