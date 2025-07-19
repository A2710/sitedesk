import { RequestHandler, Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { adminUserCreateSchema, AdminUserCreateInput, adminUserUpdateSchema, AdminUserUpdateInput } from "@repo/common/types";
import bcrypt from "bcryptjs";

export const listUsers: RequestHandler = async (req : Request, res: Response) : Promise<void> => {
    try{
        const organizationId = req.user!.organizationId;

        const users = await prismaClient.user.findMany({
            where: { organizationId },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true, 
                isOnline: true, 
                createdAt: true, 
                teams: { 
                    include: { 
                        team: true 
                    } 
                } 
            }
        });
        res.json(users);
    }
    catch(error:any)
    {
        console.error("Error in listUsers:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getMe: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    try {
        const user = await prismaClient.user.findFirst({
        where: { id: req.user!.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isOnline: true,
            createdAt: true,
            teams: { include: { team: true } }
        }
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const {teams: teamsincluded, ...restData} = user;
        const teamsDataArray = teamsincluded.map(t => t.team);

        res.status(200).json({
            ...restData,
            teamsDataArray
        });
        return;
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
};


export const createUser: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    const parsed = adminUserCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid input" });  
        return;
    } 

    const { name, email, password, role, teamId }: AdminUserCreateInput = parsed.data;
    const organizationId = req.user!.organizationId;

    try {
        const existing = await prismaClient.user.findUnique({ 
            where: { 
                email
            }
        });

        if (existing) {
            res.status(409).json({ message: "User already exists" });
            return;
        } 

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await prismaClient.user.create({
        data: { 
            name, 
            email, 
            password: hash, 
            role, 
            organizationId 
        }
        });

        //team assignment
        if (teamId) {
            const team = await prismaClient.team.findFirst({
                where: { 
                    id: teamId, 
                    organizationId 
                } 
            });
            
            if (team) {
                await prismaClient.userTeam.deleteMany({
                     where: { 
                        userId: user.id
                    } 
                });
                
                await prismaClient.userTeam.create({ 
                    data: { 
                        userId: user.id, 
                        teamId 
                    } 
                });
            }
        }

        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, team: teamId });

    } catch (error) {
        console.error("Error in createUser:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


export const getUserById: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    //if ADMIN - can access anyone, if AGENT can access itself only
    if (req.user!.role !== "ADMIN" && req.user!.id !== Number(id)) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    
    const user = await prismaClient.user.findFirst({
      where: { id: Number(id), organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnline: true,
        createdAt: true,
        teams: { include: { team: true } }
      }
    });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;        
    } 

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};


export const updateUser: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    // Validating the input
    const parsed = adminUserUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
      return;
    }
    const { name, role, password, isOnline, teamId, email }: AdminUserUpdateInput = parsed.data;

    // Admin and self - status - checks
    const isAdmin = req.user!.role === "ADMIN";
    const isSelf = req.user!.id === Number(id);

    // Only admin or self can update
    if (!isAdmin && !isSelf) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    // Agents cannot change restricted fields
    if (!isAdmin && (role || teamId || email)) {
        res.status(403).json({ message: "Forbidden: Permission not granted" });
        return;
    }

    try {
        const user = await prismaClient.user.findFirst({ 
            where: { 
                id: Number(id),
                organizationId
            }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (isOnline !== undefined) updateData.isOnline = isOnline;
        if (isAdmin && role) updateData.role = role;
        if (isAdmin && email) updateData.email = email;
        if (password) updateData.password = await bcrypt.hash(password, 10);

        const updated = await prismaClient.user.update({
        where: { id: Number(id) },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isOnline: true,
            createdAt: true
        }
        });

        // Only admin can reassign team
        if (isAdmin && teamId) {
            const team = await prismaClient.team.findFirst({ 
                where: { 
                    id: teamId, 
                    organizationId 
                } 
            });
            
            if (team) {
                await prismaClient.userTeam.deleteMany({ 
                    where: { 
                        userId: Number(id)
                    } 
                });
                
                await prismaClient.userTeam.create({
                    data: { 
                        userId: Number(id), 
                        teamId 
                    } 
                });
            }
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("Error in updateUser:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const deleteUser : RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { id } = req.params;
        const organizationId = req.user!.organizationId;

        // cannot delete own
        if (req.user!.id === Number(id)) {
            res.status(400).json({ message: "You cannot delete your own account." });
            return;
        }

        // user should belong to same organization
        const user = await prismaClient.user.findFirst({
        where: { id: Number(id), organizationId }
        });

        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // Delete the user
        await prismaClient.user.delete({ 
            where: { 
                id: Number(id) 
            } 
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}