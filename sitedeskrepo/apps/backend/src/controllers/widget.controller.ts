import { Request, Response, RequestHandler } from "express";
import { prismaClient } from "@repo/db/client";
import { customerSchema, CustomerInput, startChatSchema, StartChatInput } from "@repo/common/types";
import { generateToken } from "@repo/common/utils";
import { promises } from "dns";
import { redisClient } from "@repo/redis";

// 1. Customer Login/Signup
export const widgetCustomerLogin: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const { name, email }: CustomerInput = parsed.data;
  const organizationId = req.organizationId!; // From middleware

  try{
    let customer = await prismaClient.customer.findFirst({ where: { email, organizationId } });
  if (!customer) {
    customer = await prismaClient.customer.create({ data: { name, email, organizationId } });
  }

  // JWT for customer, expires in 1hr
  const token = generateToken({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    role: "CUSTOMER",
    organizationId
  }, process.env.JWT_SECRET!);

  console.log("Customer joined", customer.name, customer.email);

  // Send token and customer info
  res.status(200).json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, organizationId } });
  }
  catch(e)
  {
    res.status(500).json({message: "Internal server error!"});
    return;
  }
  
};

//get the categories for category selection

export const widgetGetCategories: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const organizationId = req.organizationId!;
  try{
    const categories = await prismaClient.category.findMany({
      where: { organizationId },
      select: { id: true, name: true }
    });
    console.log("Got here at category lists");
    res.status(200).json(categories);
  }
  catch(e)
  {
    res.status(500).json({message: "Internal Server Error!"});
    return;
  }
  
};

//initiate the chat - basically can be called as the token

export const widgetStartChat: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const customer = req.customer!;
  const parsed = startChatSchema.safeParse(req.body);

  if (!parsed.success) {
    res
      .status(400)
      .json({ message: "Invalid input", issues: parsed.error.issues });
    return;
  }

  const { categoryId }: StartChatInput = parsed.data;

  try {
    //check if already started the chat
    const existingChat = await prismaClient.chat.findFirst({
      where: {
        customerId: customer.id,
        status: { in: ["WAITING", "ACTIVE"] }
      },
    });

    if (existingChat) {
      res.status(200).json({ chatId: existingChat.id, status: existingChat.status });
      return;
    }

    const category = await prismaClient.category.findFirst({
      where: {
        id: categoryId,
        organizationId: customer.organizationId,
      },
    });

    

    if (!category) {
      res.status(400).json({ message: "Invalid category." });
      return;
    }

    // Create new chat
    const chat = await prismaClient.chat.create({
      data: {
        organizationId: customer.organizationId,
        status: "WAITING",
        customerId: customer.id,
        categoryId,
      },
    });

    console.log("Chat started: ", chat);

    // Add to Redis queue
    const queueKey = `queue:org:${customer.organizationId}:category:${categoryId}`;
    // await redisClient.del(queueKey);
    // const queueContents = await redisClient.lRange(queueKey, 0, -1);
    // console.log("deleted all");
    await redisClient.rPush(queueKey, chat.id.toString());
    
    const queueContents2 = await redisClient.lRange(queueKey, 0, -1);
    console.log("Current queue:", queueContents2);
    

    res.status(201).json({ chatId: chat.id, status: "WAITING" });
    return;
  } catch (e: any) {
    console.log("Error in widgetStartChat: ", e);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};




// For listing the previous chats history
export const widgetGetChats: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const customer = req.customer!;
  const chats = await prismaClient.chat.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true, categoryId: true }
  });
  res.status(200).json(chats);
};

// Get Messages in a Chat (after agent assignment, for reference)
export const widgetGetChatMessages: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const customer = req.customer!;
  const { chatId } = req.params;
  const chat = await prismaClient.chat.findFirst({ where: { id: chatId, customerId: customer.id } });
  if (!chat) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }
  const messages = await prismaClient.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" }
  });
  res.status(200).json(messages);
};

// Customer cancels their own chat (requeue for waiting)
export const widgetCancelChat: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const customer = req.customer!;
  const { chatId } = req.params;

  // Confirm chat exists, belongs to customer, and is not already closed
  const chat = await prismaClient.chat.findFirst({
    where: {
      id: chatId,
      customerId: customer.id,
      status: { not: "CLOSED" }
    }
  });

  if (!chat) {
    res.status(404).json({ message: "Chat not found or already closed." });
    return;
  }

  // Mark chat as CLOSED, remove agent assignment, set closedAt
  await prismaClient.chat.update({
    where: { id: chatId },
    data: { agentId: null, status: "CLOSED", closedAt: new Date() }
  });

  res.status(200).json({ message: "Chat ended." });
};
