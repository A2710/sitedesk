import { Request, Response, RequestHandler } from "express";
import { createTeamSchema, CreateTeamInput, assignCategoriesToTeamSchema, AssignCategoriesToTeamInput, assignAgentsToTeamSchema, AssignAgentsToTeamInput, ListTeamsOutput, TeamCreateOutput } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

export const listTeams: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    
    const teams = await prismaClient.team.findMany({
      where: { organizationId },
      include: {
        categories: { 
            include: { 
                category: true 
            } 
        },
        members: { 
            include: { 
                user: true 
            } 
        }
      }
    });

    const output: ListTeamsOutput[] = teams.map(team => ({
        id: team.id,
        name: team.name,
        categories: team.categories.map(tc => ({categoryId: tc.categoryId, categoryName: tc.category.name})),
        members: team.members.map(tm => ({userId: tm.userId, userName: tm.user.name})),
    }));

    res.status(200).json(output);
    return;
  } catch (error) {
    console.error("Error in listTeams:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const getTeamById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    const team = await prismaClient.team.findFirst({
      where: { 
            id: Number(id), 
            organizationId 
      },
      include: {
        categories: { 
            include: { 
                category: true 
            } 
        },
        members: { 
            include: { 
                user: true 
            }
        }
      }
    });

    if (!team) {
      res.status(404).json({ message: "Team not found." });
      return;
    }

    const members = team.members.map(tm => ({
      userId: tm.user.id,
      userName: tm.user.name
    }))

    const categories = team.categories.map(tc => ({
      categoryId: tc.category.id,
      categoryName: tc.category.name
    }))

    const output: ListTeamsOutput = {
      id: team.id,
      name: team.name,
      categories,
      members
    };

    res.status(200).json(output);
    return;
  } catch (error) {
    console.error("Error in getTeamById:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const createTeam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createTeamSchema.safeParse(req.body);

    if(!parsed.success)
    {
        res.status(400).json({ message: "Invalid input", issues: parsed.error.issues});
        return;
    }

    const {name} : CreateTeamInput = parsed.data;
    const organizationId = req.user!.organizationId;

    if (!name || name.length < 2) {
      res.status(400).json({ message: "Invalid team name." });
      return;
    }

    const team:TeamCreateOutput = await prismaClient.team.create({
      data: { name, organizationId }
    });

    res.status(201).json(team);
    return;
  } catch (error) {
    console.error("Error in createTeam:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const updateTeam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = createTeamSchema.safeParse(req.body);

    if(!parsed.success)
    {
        res.status(400).json({ message: "Invalid input", issues: parsed.error.issues});
        return;
    }

    const { name } : CreateTeamInput = parsed.data;
    const organizationId = req.user!.organizationId;

    if (!name || name.length < 2) {
        res.status(400).json({ message: "Invalid team name." });
        return;
    }

    const team = await prismaClient.team.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!team) {
        res.status(404).json({ message: "Team not found." });
        return;
    }

    const updated:TeamCreateOutput = await prismaClient.team.update({
        where: {
            id: Number(id) 
        },
        data: { 
            name 
        }
    });

    res.status(200).json(updated);
    return;
  } catch (error) {
        console.error("Error in updateTeam:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
  }
};


export const deleteTeam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    const team = await prismaClient.team.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!team) {
      res.status(404).json({ message: "Team not found." });
      return;
    }

    await prismaClient.team.delete({ where: { id: Number(id) } });
    res.status(204).send();
    return;
  } catch (error) {
    console.error("Error in deleteTeam:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};


export const assignCategoriesToTeam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // team id
    const parsed = assignCategoriesToTeamSchema.safeParse(req.body); // expects array of category IDs

    if(!parsed.success)
    {
        res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
        return;
    }

    const { categoryIds } : AssignCategoriesToTeamInput = parsed.data;
    const organizationId = req.user!.organizationId;

    // Validate team
    const team = await prismaClient.team.findFirst({ 
        where: { 
            id: Number(id), 
            organizationId 
        } 
    });

    if (!team) {
        res.status(404).json({ message: "Team not found." });
        return;
    }

    // Validate categories
    const categories = await prismaClient.category.findMany({
      where: { 
        id: { 
            in: categoryIds 
        }, 
        organizationId 
      }
    });
    
    if (categories.length !== categoryIds.length) {
      res.status(400).json({ message: "Some categories not found in your organization." });
      return;
    }

    // Remove old assignments
    await prismaClient.teamCategory.deleteMany({ 
        where: { 
            teamId: Number(id) 
        } 
    });

    // Assign new categories
    await prismaClient.teamCategory.createMany({
      data: categoryIds.map((categoryId: number) => ({
        teamId: Number(id),
        categoryId
      }))
    });

    res.status(200).json({ message: "Categories assigned to team." });
    return;
  } catch (error) {
    console.error("Error in assignCategoriesToTeam:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};


export const assignAgentsToTeam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // team id
        const parsed = assignAgentsToTeamSchema.safeParse(req.body); // expects array of user IDs

        if(!parsed.success)
        {
            res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
            return;
        }

        const { userIds } : AssignAgentsToTeamInput = parsed.data;
        const organizationId = req.user!.organizationId;

        // Validate team
        const team = await prismaClient.team.findFirst({ 
            where: { 
                id: Number(id), 
                organizationId 
            } 
        });

        if (!team) {
            res.status(404).json({ message: "Team not found." });
            return;
        }

        // Validate users
        const users = await prismaClient.user.findMany({
            where: { 
                id: { 
                    in: userIds 
                }, 
                organizationId 
            }
        });
        if (users.length !== userIds.length) {
        res.status(400).json({ message: "Some users not found in your organization." });
        return;
        }

        // Remove old assignments
        await prismaClient.userTeam.deleteMany({ where: { teamId: Number(id) } });

        // Assign new users
        await prismaClient.userTeam.createMany({
        data: userIds.map((userId: number) => ({
            userId,
            teamId: Number(id)
        }))
        });

        res.status(200).json({ message: "Agents assigned to team." });
        return;
    } catch (error) {
        console.error("Error in assignAgentsToTeam:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
};
