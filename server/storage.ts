import { type User, type InsertUser, type Carte, type InsertCarte } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createCarte(carte: InsertCarte): Promise<Carte>;
  getRecentCartes(limit?: number): Promise<Carte[]>;
  getAllCartes(): Promise<Carte[]>;
  getCarteById(id: string): Promise<Carte | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cartes: Map<string, Carte>;

  constructor() {
    this.users = new Map();
    this.cartes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCarte(insertCarte: InsertCarte): Promise<Carte> {
    const id = randomUUID();
    const carte: Carte = { 
      ...insertCarte, 
      id, 
      cree_a: new Date(),
      modifie_a: new Date()
    };
    this.cartes.set(id, carte);
    return carte;
  }

  async getRecentCartes(limit: number = 5): Promise<Carte[]> {
    const cartes = Array.from(this.cartes.values())
      .sort((a, b) => new Date(b.cree_a!).getTime() - new Date(a.cree_a!).getTime())
      .slice(0, limit);
    return cartes;
  }

  async getAllCartes(): Promise<Carte[]> {
    return Array.from(this.cartes.values())
      .sort((a, b) => new Date(b.cree_a!).getTime() - new Date(a.cree_a!).getTime());
  }

  async getCarteById(id: string): Promise<Carte | undefined> {
    return this.cartes.get(id);
  }
}

export const storage = new MemStorage();
