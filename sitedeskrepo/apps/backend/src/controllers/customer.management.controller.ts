import { Request, Response, RequestHandler } from "express";
import { prismaClient } from "@repo/db/client";
import { customerSchema, CustomerInput } from "@repo/common/types";
import { generateToken } from "@repo/common/utils";

// List all customers in org
export const listCustomers: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const customers = await prismaClient.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error in listCustomers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get customer by ID
export const getCustomerById: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    const customer = await prismaClient.customer.findFirst({
      where: { id: Number(id), organizationId }
    });
    if (!customer)
    {
      res.status(404).json({ message: "Customer not found." });
      return;
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update customer (admin/agent only)
export const updateCustomer: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  const { id } = req.params;
  const parsed = customerSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const organizationId = req.user!.organizationId;
  try {
    const customer = await prismaClient.customer.findFirst({ where: { id: Number(id), organizationId } });
    if (!customer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    } 
    const updated = await prismaClient.customer.update({
      where: { id: Number(id) },
      data: parsed.data,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// No delete route if you want to keep chat history forever (recommended)
