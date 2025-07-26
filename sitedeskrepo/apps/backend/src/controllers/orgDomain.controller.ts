import { Request, Response, RequestHandler } from "express";
import { prismaClient } from "@repo/db/client";
import { orgDomainSchema, OrgDomainInput } from "@repo/common/types";


export const getDomainById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    try {
    // The domain should belong to the organization
    const domain = await prismaClient.orgDomain.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!domain) {
      res.status(404).json({ message: "Domain not found." });
      return;
    }

    res.status(200).json(domain);
  } catch (error: any) {
    console.error("Error fetching domain by ID:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const listDomains: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizationId = req.user!.organizationId;
        const domains = await prismaClient.orgDomain.findMany({
            where: {
                organizationId
            }
        });
        res.status(200).json(domains);
    }
    catch(error) {
        res.status(500).json({message: "Internal server error!"});
        return;
    }
}

export const registerDomain: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const parsedResult = orgDomainSchema.safeParse(req.body);

    if(!parsedResult.success)
    {
        res.status(400).json({message: "Invalid domain format"});
        return;
    }

    const {domain}: OrgDomainInput = parsedResult.data;

    const organizationId = req.user!.organizationId;

    try {
        const newDomain = await prismaClient.orgDomain.create({
            data: { domain, organizationId}
        });
        res.status(201).json({newDomain});
    }
    catch(error: any) {
        if(error.code === "P2002")
        {
            res.status(409).json({ message: "Domain already exists." });
            return;
        }
        res.status(500).json({ message: "Failed to add Domain!" });
    }
}

export async function editDomain(req: Request, res: Response): Promise<void> {
  
        const { id } = req.params;
        const parsed = orgDomainSchema.safeParse(req.body);

        if (!parsed.success)
        {
            res.status(400).json({ message: "Invalid domain format" });
            return;
        }
        const { domain }: OrgDomainInput = parsed.data;
        const organizationId = req.user!.organizationId;
    
    try {
        // Check for duplicate
        // Is there an existing record for this domain in this org?
        const existing = await prismaClient.orgDomain.findFirst({
            where: { domain, organizationId }
        });

        if (existing && existing.id !== Number(id)) {
            res.status(409).json({ message: "Domain already exists." });
            return;
        }

        // The domain should belong to the organization
        //Does the record with this id exist and is it part of this org?
        const current = await prismaClient.orgDomain.findFirst({
        where: { id: Number(id), organizationId }
        });
        if (!current) {
            res.status(404).json({ message: "Domain not found." });
            return;
        }

        //updating the domain after all validation and checks
        const updated = await prismaClient.orgDomain.update({
        where: { id: current.id },
        data: { domain }
        });
        res.status(200).json(updated);
    }
    catch (error: any) {
        //error logging
        console.error("Error in editDomain:", error.message || error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteDomain: RequestHandler = async (req: Request, res: Response):Promise<void> => {
    try {
        const { id } = req.params;
        const organizationId = req.user!.organizationId;

        // The domain should belong to this organization
        const domain = await prismaClient.orgDomain.findFirst({
        where: { id: Number(id), organizationId }
        });

        if (!domain) {
        res.status(404).json({ message: "Domain not found." });
        return;
        }

        await prismaClient.orgDomain.delete({ where: { id: domain.id } });
        res.status(204).json({message: "Domain deleted"});
    }
    catch (error: any) {
        console.error("Error deleting domain:", error.message || error);
        res.status(500).json({ message: "Internal server error" });
    }
}
