import { Request, Response, RequestHandler } from "express";
import { categorySchema, CategoryInput, categoriesOutput } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

export const listCategories:RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    try {
        const organizationId = req.user!.organizationId;
        const categories:categoriesOutput[] = await prismaClient.category.findMany({
            where: { organizationId }
        });
        res.status(200).json(categories);
        return;
    } catch (error) {
        console.error("Error in listCategories:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
};

//get the categories and teams with those respective categories
export const getCategoryById: RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { id } = req.params;
        const organizationId = req.user!.organizationId;
        
        const category = await prismaClient.category.findFirst({
            where: { id: Number(id), organizationId },
            include: { teams: { include: { team: true } } }
        });

        if (!category)
        {
            res.status(404).json({ message: "Category not found." });
            return;
        }

        const {teams: joinFields, ...fields} = category;

        const team = joinFields.map(j => j.team);

        res.status(200).json({...fields, team});
        return;
    } catch (error) {
        console.error("Error in getCategoryById:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
};

export const createCategory : RequestHandler = async (req: Request, res: Response) : Promise<void> => {
  const parsed = categorySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid category name." });
    return;
  }

  const { name }: CategoryInput = parsed.data;
  const organizationId = req.user!.organizationId;

  try {
    const existing = await prismaClient.category.findFirst({ 
        where: { 
            name, 
            organizationId 
        } 
    });

    if (existing) {
        res.status(409).json({ message: "Category with this name already exists." });
        return;
    }

    const category:categoriesOutput = await prismaClient.category.create({
      data: { 
        name, 
        organizationId 
    }
    });
    res.status(201).json(category);
    return;
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};


export const editCategory : RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    const { id } = req.params;
    const parsed = categorySchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({ message: "Invalid category name." }); 
        return;
    }
    const { name } : CategoryInput = parsed.data;
    const organizationId = req.user!.organizationId;

    try {
        const existing = await prismaClient.category.findFirst({ 
            where: { 
                name, 
                organizationId 
            } 
        });

        if (existing && existing.id !== Number(id))
        {
            res.status(409).json({ message: "Category with this name already exists." });
            return;
        }

        const current = await prismaClient.category.findFirst({ 
            where: {
                id: Number(id), 
                organizationId 
            } 
        });

        if (!current){
            res.status(404).json({ message: "Category not found." });
            return;
        }

        const updated:categoriesOutput = await prismaClient.category.update({
            where: { id: current.id },
            data: { name }
        });

        res.status(200).json(updated);
        return;
    } catch (error) {
        console.error("Error in editCategory:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
};

export const deleteCategory : RequestHandler = async (req : Request, res : Response) : Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    
    const category = await prismaClient.category.findFirst({ 
        where: { 
            id: Number(id), 
            organizationId 
        } 
    });

    if (!category) {
        res.status(404).json({ message: "Category not found." });
        return;
    } 

    await prismaClient.category.delete({ 
        where: { 
            id: category.id 
        } 
    });

    res.status(204).json({message: "Category deleted."});
    return;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const listCategoryTeams : RequestHandler = async (req : Request, res : Response) : Promise<void> => {
    const { id } = req.params; // category id
    const organizationId = req.user!.organizationId;
    try {

        const category = await prismaClient.category.findFirst({
        where: { 
            id: Number(id),
            organizationId
        },
        include: { 
            teams: { 
                include: { 
                    team: true 
                } 
            } 
        }
        });
        if (!category) {
            res.status(404).json({ message: "Category not found." });
            return;
        } 

        res.status(200).json(category.teams.map(tc => tc.team));
        return;
    } 
    catch (error) {
        console.error("Error in listCategoryTeams:", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
};
