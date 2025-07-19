import { RequestHandler, Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { sendMessageSchema, SendMessageInput, assignChatSchema, AssignChatInput, AddCustomerNoteInput, addCustomerNoteSchema } from "@repo/common/types";

// list all chats assigned to the agent
export const listMyChats: RequestHandler = async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const organizationId = req.user!.organizationId;

    const chats = await prismaClient.chat.findMany({
      where: {
        agentId,
        // Optionally restrict by organization
        customer: { organizationId }
      },
      include: {
        customer: true,
        category: true,
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in listMyChats:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// List all chats in the agent's organization (for admins)
export const listAllOrgChats: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;

    const chats = await prismaClient.chat.findMany({
      where: {
        customer: { organizationId }
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        agent: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in listAllOrgChats:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// get the chat based on the id
export const getChatById: RequestHandler = async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const { chatId } = req.params;

    const chat = await prismaClient.chat.findFirst({
      where: {
        id: Number(chatId),
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

export const listWaitingChats: RequestHandler = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user!.organizationId;
    const chats = await prismaClient.chat.findMany({
      where: {
        status: "WAITING",
        customer: { organizationId }
      },
      include: { customer: true, category: true }
    });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in listWaitingChats:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


//only admin can assign the chat to others, and the agent can asign to the self
export const agentAssignChat: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  
  const parsedAssign = assignChatSchema.safeParse(req.body);
  if (!parsedAssign.success) {
    res.status(400).json({ message: "Invalid input", issues: parsedAssign.error.issues });
    return;
  }
  const { agentId: requestedAgentId }: AssignChatInput = parsedAssign.data;

  const { chatId } = req.params;
  const organizationId = req.user!.organizationId;
  const actor = req.user!;

  try {
    // Only assign WAITING chats in your org
    const chat = await prismaClient.chat.findFirst({
      where: {
        id: Number(chatId),
        status: "WAITING",
        customer: { organizationId }
      }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found or not WAITING." });
      return;
    }

    // Admin can override agentId, otherwise assign to self
    let agentId = actor.id;
    if (actor.role === "ADMIN" && typeof requestedAgentId === "number") {
      agentId = requestedAgentId;
    }

    const updated = await prismaClient.chat.update({
      where: { id: chat.id },
      data: { agentId, status: "ACTIVE" }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in agentAssignChat:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET /chats/:chatId/messages
export const agentGetChatMessages: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const { chatId } = req.params;
  const organizationId = req.user!.organizationId;
  try {
    const chat = await prismaClient.chat.findFirst({
      where: { id: Number(chatId), customer: { organizationId } }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }
    const messages = await prismaClient.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" }
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in agentGetChatMessages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


// agent sends the message in the offline mode, if the socket connection not open
export const agentSendMessage: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  // parse & validate body
  const parsedMsg = sendMessageSchema.safeParse(req.body);
  if (!parsedMsg.success) {
    res.status(400).json({ message: "Invalid input", issues: parsedMsg.error.issues });
    return;
  }
  const { content }: SendMessageInput = parsedMsg.data;

  const { chatId } = req.params;
  const agent = req.user!;

  try {
    // Confirm assignment and org
    const chat = await prismaClient.chat.findFirst({
      where: {
        id: Number(chatId),
        agentId: agent.id,
        customer: { organizationId: agent.organizationId }
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
        senderId: agent.id,
        receiverType: "customer",
        receiverId: chat.customerId,
        content: content.trim(),
        createdAt: new Date()
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in agentSendMessage:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const closeChat: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const { chatId } = req.params;
  const organizationId = req.user!.organizationId;
  try {
    const chat = await prismaClient.chat.findFirst({
      where: { id: Number(chatId), customer: { organizationId } }
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }
    const closed = await prismaClient.chat.update({
      where: { id: chat.id },
      data: { status: "CLOSED", closedAt: new Date() }
    });
    res.status(200).json(closed);
  } catch (error) {
    console.error("Error in closeChat:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


//adding notes to the customer
export const addCustomerNote: RequestHandler = async (req: Request, res: Response): Promise<void> => {

  const parsedNote = addCustomerNoteSchema.safeParse(req.body);
  if (!parsedNote.success) {
    res.status(400).json({ message: "Invalid input", issues: parsedNote.error.issues });
    return;
  }
  const { content }: AddCustomerNoteInput = parsedNote.data;

  const { chatId } = req.params;
  const authorId = req.user!.id;
  const organizationId = req.user!.organizationId;

  try {
    // Verify chat & fetch its customerId
    const chat = await prismaClient.chat.findFirst({
      where: {
        id: Number(chatId),
        customer: { organizationId }
      },
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
