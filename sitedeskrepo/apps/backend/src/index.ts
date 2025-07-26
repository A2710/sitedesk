import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import orgDomainRoutes from "./routes/orgDomain.route";
import teamRoutes from "./routes/teams.route";
import categoryRoutes from "./routes/category.route";
import userRoutes from "./routes/user.route";
import customerRoutes from "./routes/customer.management.route";
import widgetRoutes from "./routes/widget.route";
import orgRoutes from "./routes/org.route";
import { authenticateJWT, requireRole } from "@repo/common/middleware";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));

//main routes

app.use("/api/auth", authRoutes);
app.use("/api/org", authenticateJWT, requireRole("ADMIN", "AGENT"), orgRoutes);
app.use("/api/orgDomain",authenticateJWT, requireRole("ADMIN"), orgDomainRoutes);
app.use("/api/teams",authenticateJWT, teamRoutes);
app.use("/api/category", authenticateJWT, requireRole("ADMIN"), categoryRoutes);
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/customer", authenticateJWT, requireRole("ADMIN", "AGENT"), customerRoutes);
app.use("/api/widget", widgetRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});