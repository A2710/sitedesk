import { Request, Response, RequestHandler } from "express";
import { prismaClient } from "@repo/db/client";
import { customerSchema, CustomerInput, startChatSchema, StartChatInput } from "@repo/common/types";
import { generateToken } from "@repo/common/utils";
import { promises } from "dns";

// 1. Customer Login/Signup
export const widgetCustomerLogin: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const { name, email }: CustomerInput = parsed.data;
  const organizationId = req.organizationId!; // From middleware

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

  // Send token and customer info
  res.status(200).json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, organizationId } });
};

//get the categories for category selection

export const widgetGetCategories: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const organizationId = req.organizationId!;
  const categories = await prismaClient.category.findMany({
    where: { organizationId },
    select: { id: true, name: true }
  });
  res.status(200).json(categories);
};

//initiate the chat - basically can be called as the token

export const widgetStartChat: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const customer = req.customer!;
  const parsed = startChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const { categoryId }: StartChatInput = parsed.data;

  // Verify category belongs to org
  const category = await prismaClient.category.findFirst({
    where: { id: categoryId, organizationId: customer.organizationId }
  });
  if (!category) {
    res.status(400).json({ message: "Invalid category." });
    return;
  }

  // Create chat with WAITING status
  const chat = await prismaClient.chat.create({
    data: {
      status: "WAITING",
      customerId: customer.id,
      categoryId: categoryId as number
    }
  });
  res.status(201).json({ chatId: chat.id, status: "WAITING" });
};


// 4. for listing the previous chats
export const widgetGetChats: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const customer = req.customer!;
  const chats = await prismaClient.chat.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true, categoryId: true }
  });
  res.status(200).json(chats);
};

// 5. Get Messages in a Chat (after agent assignment, for reference)
export const widgetGetChatMessages: RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  const customer = req.customer!;
  const { chatId } = req.params;
  const chat = await prismaClient.chat.findFirst({ where: { id: Number(chatId), customerId: customer.id } });
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