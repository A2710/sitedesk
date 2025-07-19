import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import {userSignup, userSignin} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { generateToken, JwtPayload } from "@repo/common/utils";

export const signup: RequestHandler = async (req: Request, res: Response): Promise<void> => {

    const parsedResult = userSignup.safeParse(req.body);
    if(!parsedResult.success)
    {
        res.status(400).json({
            message: "Incorrect inputs"
        });
        return;
    }

    const { name, email, organizationName, password } = parsedResult.data;

    try{
        
        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });

        if(existingUser)
        {
            res.status(409).json({error: 'User exists'});
            return
        }

        const organization = await prismaClient.organization.create({
            data: { name: organizationName }
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await prismaClient.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
                organizationId: organization.id
            }
        });


        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId

        }, process.env.JWT_SECRET);

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, //in ms
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.MODE_ENV !== "development"
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }
        });
        return;

    }
    catch(error: any){
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal server error"});
        return;
    }
}

export const signin: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const parsedResult = userSignin.safeParse(req.body);
    if(!parsedResult.success)
    {
        res.status(400).json({
            message: "Incorrect inputs"
        });
        return;
    }

    const { email, password } = parsedResult.data;

    try{
        
        const user = await prismaClient.user.findFirst({
            where: {
                email
            }
        });

        if(!user)
        {
            res.status(404).json({error: 'User with this email does not exist.'});
            return;
        }

        const comparePassword = await bcrypt.compare(password, user.password);

        if(!comparePassword)
        {
            res.status(401).json({message: "Invalid credentials!"});
            return;
        }

        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId

        }, process.env.JWT_SECRET);

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, //in ms
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.MODE_ENV !== "development"
        });

        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }
        });
        return;

    }
    catch(error: any){
        console.log("Error in signin controller", error.message);
        res.status(500).json({ error: "Internal server error"});
        return;
    }
}

export const logout: RequestHandler = (req: Request, res: Response): void => {
    try{

        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully!"});
        return;
    }
    catch(err: any)
    {
        res.status(500).json({message: "Internal server error!"});
        return;
    }
}