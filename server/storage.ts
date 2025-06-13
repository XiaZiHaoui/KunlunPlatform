import {
  users,
  kun,
  conversations,
  messages,
  payments,
  usageStats,
  type User,
  type UpsertUser,
  type AiModel,
  type Conversation,
  type Message,
  type Payment,
  type UsageStat,
  type InsertConversation,
  type InsertMessage,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // AI Models
  getAllModels(): Promise<AiModel[]>;
  getActiveModels(): Promise<AiModel[]>;
  getModelById(id: number): Promise<AiModel | undefined>;
  insertModels(models: any[]): Promise<void>;

  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversationById(id: number): Promise<Conversation | undefined>;

  // Messages
  addMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getUserPayments(userId: string): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<void>;

  // Usage tracking
  incrementUsage(userId: string, modelId: number): Promise<void>;
  getUserDailyUsage(userId: string): Promise<number>;
  resetDailyUsage(userId: string): Promise<void>;

  // Admin functions
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    vipUsers: number;
    todayCalls: number;
    monthlyRevenue: number;
  }>;
  updateUserRole(userId: string, role: string, vipExpiresAt?: Date): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // AI Models
  async getAllModels(): Promise<AiModel[]> {
    return await db.select().from(kun).orderBy(kun.name);
  }

  async getActiveModels(): Promise<AiModel[]> {
    return await db.select().from(kun).where(eq(kun.isActive, true)).orderBy(kun.name);
  }

  async getModelById(id: number): Promise<AiModel | undefined> {
    const [model] = await db.select().from(kun).where(eq(kun.id, id));
    return model || undefined;
  }

  async insertModels(models: any[]): Promise<void> {
    await db.insert(kun).values(models);
  }

  // Conversations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversationById(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || undefined;
  }

  // Messages
  async addMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id));
  }

  // Usage tracking
  async incrementUsage(userId: string, modelId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if usage record exists for today
    const [existingStat] = await db
      .select()
      .from(usageStats)
      .where(
        and(
          eq(usageStats.userId, userId),
          eq(usageStats.modelId, modelId),
          gte(usageStats.date, today)
        )
      );

    if (existingStat) {
      await db
        .update(usageStats)
        .set({ requestCount: existingStat.requestCount + 1 })
        .where(eq(usageStats.id, existingStat.id));
    } else {
      await db.insert(usageStats).values({
        userId,
        modelId,
        date: new Date(),
        requestCount: 1,
      });
    }

    // Update user's daily usage
    const user = await this.getUser(userId);
    if (user) {
      const lastReset = user.lastUsageReset || new Date(0);
      const shouldReset = lastReset < today;

      await db
        .update(users)
        .set({
          dailyUsage: shouldReset ? 1 : user.dailyUsage + 1,
          lastUsageReset: shouldReset ? new Date() : user.lastUsageReset,
        })
        .where(eq(users.id, userId));
    }
  }

  async getUserDailyUsage(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.lastUsageReset || new Date(0);

    if (lastReset < today) {
      await this.resetDailyUsage(userId);
      return 0;
    }

    return user.dailyUsage;
  }

  async resetDailyUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        dailyUsage: 0,
        lastUsageReset: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    vipUsers: number;
    todayCalls: number;
    monthlyRevenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [totalUsersCount] = await db
      .select({ count: count() })
      .from(users);

    const [vipUsersCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "vip"),
          gte(users.vipExpiresAt, new Date())
        )
      );

    const [todayCallsCount] = await db
      .select({ total: sum(usageStats.requestCount) })
      .from(usageStats)
      .where(gte(usageStats.date, today));

    const [monthlyRevenueSum] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        and(
          eq(payments.status, "completed"),
          gte(payments.createdAt, thisMonth)
        )
      );

    return {
      totalUsers: totalUsersCount.count,
      vipUsers: vipUsersCount.count,
      todayCalls: Number(todayCallsCount.total || 0),
      monthlyRevenue: Number(monthlyRevenueSum.total || 0),
    };
  }

  async updateUserRole(userId: string, role: string, vipExpiresAt?: Date): Promise<void> {
    await db
      .update(users)
      .set({
        role,
        vipExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();