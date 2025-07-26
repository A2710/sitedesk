import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client"; // Adjust import to your setup
import { OrganizationBase } from "@repo/common/types";

export const getOrganizationDetails = async (req: Request, res: Response) => {
  const orgId = Number(req.params.id);

  if (!orgId) {
    return res.status(400).json({ message: "Invalid organization id" });
  }

  try {
    const organization = await prismaClient.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json(organization as OrganizationBase);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
