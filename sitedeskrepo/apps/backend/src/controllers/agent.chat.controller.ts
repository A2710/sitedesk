import { RequestHandler, Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { sendMessageSchema, SendMessageInput, addCustomerNoteSchema, AddCustomerNoteInput } from "@repo/common/types";
import { redisClient } from "@repo/redis";
import { io } from "../socket";
import { error } from "console";

// List all chats assigned to the agent in org
export const listMyChats = async (req : Request, res: Response) : Promise<void> => {
  try {
    const agentId: number = req.user!.id;
    const organizationId: number = req.user!.organizationId;

    const chats = await prismaClient.chat.findMany({
      where: {
        agentId,
        organizationId
      },
      include: { customer: true, category: true },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in listMyChats:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// List all chats in the org
export const listAllOrgChats: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  try {
    const organizationId: number = req.user!.organizationId;

    const chats = await prismaClient.chat.findMany({
      where: {
        organizationId
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in listAllOrgChats:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get the chat based on id and org
export const getChatById: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  try {
    const agentId: number = req.user!.id;
    const organizationId: number = req.user!.organizationId;
    const { chatId } = req.params;

    const chat = await prismaClient.chat.findFirst({
      where: {
        id: chatId,
        organizationId,
        agentId,
        customer: { organizationId }
      },
      include: {
        customer: true,
        messages: { orderBy: { createdAt: "asc" } }
      }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found or not assigned to you." });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in getChatById:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// List all waiting chats in org
export const listWaitingChats: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  try {
    const organizationId: number = req.user!.organizationId;
    const chats = await prismaClient.chat.findMany({
      where: {
        status: "WAITING",
        organizationId
      },
      include: { customer: true, category: true }
    });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in listWaitingChats:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Auto-assign next chat in org (uses Redis queue)
export const assignNextChat: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const agentId: number = req.user!.id;
  const organizationId: number = req.user!.organizationId;

  const agent = await prismaClient.user.findUnique({
    where: { id: agentId, organizationId },
    include: {
      teams: {
        include: {
          team: { include: { categories: true } }
        }
      }
    }
  });

  if (!agent) {
    res.status(404).json({ message: "Agent not found in this organization" });
    return;
  }

  // Collect unique category IDs for this org
  const categoryIds = new Set<number>();
  agent.teams.forEach((ut) =>
    ut.team.categories.forEach((tc) => categoryIds.add(tc.categoryId))
  );

  // logic to find the oldest chat across all eligible categories
  let minChatId: string | null = null;
  let minCategoryId: number | null = null;
  let minCreatedAt = Number.MAX_SAFE_INTEGER;

  for (const categoryId of categoryIds) {
    const queueKey = `queue:org:${organizationId}:category:${categoryId}`;
    const chatId = await redisClient.lIndex(queueKey, 0); // here we peek the oldest chat

    if (chatId) {
      // fetch chat's createdAt to decide oldest
      const chat = await prismaClient.chat.findUnique({
        where: { id: chatId },
        select: { createdAt: true }
      });

      if (chat && chat.createdAt.getTime() < minCreatedAt) {
        minCreatedAt = chat.createdAt.getTime();
        minChatId = chatId;
        minCategoryId = categoryId;
      }
    }
  }

  // No chat found
  if (!minChatId || !minCategoryId) {
    res.status(204).json({ message: "No waiting chats" });
    return;
  }

  // Popping the oldest chat from the queue - which is min based on timestamp
  const queueKey = `queue:org:${organizationId}:category:${minCategoryId}`;
  const poppedChatId = await redisClient.lPop(queueKey);

  if (!poppedChatId) {
    // Queue was empty
    res.status(409).json({ message: "Chat already picked up by another agent" });
    return;
  }

  if (poppedChatId !== minChatId) {
    // Put it back at the start of the queue because it's not the chat we intended
    await redisClient.lPush(queueKey, poppedChatId);

    res.status(409).json({ message: "Chat already picked up by another agent" });
    return;
  }


  // 5. Assign agent in DB and mark chat ACTIVE
  const updatedChat = await prismaClient.chat.update({
    where: { id: minChatId, organizationId },
    data: { agentId, status: "ACTIVE" },
    include: {
      customer: true,
      category: true,
      messages: true
    }
  });

  // 5. Notify agent and customer via Socket.io
  io.to(`agent:${agentId}`).emit("chat_assigned", { chat: updatedChat });
  io.to(`customer:${updatedChat.customer.id}`).emit("chat_assigned", { chat: updatedChat });

  res.status(200).json({
    message: "Chat assigned successfully",
    chat: updatedChat
  });
};


// Get all messages for a chat (org scoped)
export const agentGetChatMessages: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  const { chatId } = req.params;
  const organizationId: number = req.user!.organizationId;
  try {
    // Confirm chat is in org
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, organizationId }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }
    const messages = await prismaClient.message.findMany({
      where: { chatId: chat.id, organizationId },
      orderBy: { createdAt: "asc" }
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in agentGetChatMessages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Agent sends a message (scoped to org, must be assigned)
export const agentSendMessage: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  const parsedMsg = sendMessageSchema.safeParse(req.body);
  if (!parsedMsg.success) {
    res.status(400).json({ message: "Invalid input", issues: parsedMsg.error.issues });
    return;
  }
  const { content }: SendMessageInput = parsedMsg.data;

  const { chatId } = req.params;
  const agentId: number = req.user!.id;
  const organizationId: number = req.user!.organizationId;

  try {
    // Confirm assignment and org
    const chat = await prismaClient.chat.findFirst({
      where: {
        id: chatId,
        organizationId,
        agentId
      }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found or not assigned to you." });
      return;
    }

    const message = await prismaClient.message.create({
      data: {
        chatId: chat.id,
        senderType: "agent",
        senderId: agentId,
        receiverType: "customer",
        receiverId: chat.customerId,
        content: content.trim(),
        createdAt: new Date(),
        organizationId
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in agentSendMessage:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// === Cancel chat & requeue ===
export const cancelChat: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  const agentId: number = req.user!.id;
  const organizationId: number = req.user!.organizationId;
  const { chatId } = req.params;

  // Find chat assigned to this agent, in this org, and ACTIVE
  try{
    const chat = await prismaClient.chat.findFirst({
      where: {
        id: chatId,
        agentId,
        organizationId,
        status: "ACTIVE"
      },
      select: {
        id: true,
        categoryId: true,
        customerId: true
      }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found or not assigned to you." });
      return;
    }

    // Requeue in Redis
    const queueKey = `queue:org:${organizationId}:category:${chat.categoryId}`;
    await redisClient.lPush(queueKey, chat.id.toString());

    // Unassign agent, mark as WAITING
    await prismaClient.chat.update({
      where: { id: chat.id },
      data: { agentId: null, status: "WAITING" }
    });

    // Optionally notify customer (or agent UI, etc)
    io.to(`customer:${chat.customerId}`).emit("chat_requeued", { chatId: chat.id });

    res.status(200).json({ message: "Chat cancelled and requeued." });
    return;
  }
  catch(error)
  {
    res.status(500).json({error});
    return;
  }
};


// Agent closes the chat (org scoped)
export const closeChat: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  const { chatId } = req.params;
  const organizationId: number = req.user!.organizationId;
  try {
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, organizationId }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }
    const closed = await prismaClient.chat.update({
      where: { id: chat.id, organizationId },
      data: { status: "CLOSED", closedAt: new Date() }
    });
    res.status(200).json(closed);
  } catch (error) {
    console.error("Error in closeChat:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add an internal customer note (org scoped)
export const addCustomerNote: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  const parsedNote = addCustomerNoteSchema.safeParse(req.body);
  if (!parsedNote.success) {
    res.status(400).json({ message: "Invalid input", issues: parsedNote.error.issues });
    return;
  }
  const { content }: AddCustomerNoteInput = parsedNote.data;

  const { chatId } = req.params;
  const authorId: number = req.user!.id;
  const organizationId: number = req.user!.organizationId;

  try {
    // Verify chat & fetch its customerId, org-scoped
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, organizationId },
      select: { id: true, customerId: true }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }

    const note = await prismaClient.customerNote.create({
      data: {
        content: content.trim(),
        authorId,
        customerId: chat.customerId,
        chatId: chat.id,
        createdAt: new Date()
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error in addCustomerNote:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
