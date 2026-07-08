import { Router } from "express";

import { AuthRoutes } from "../auth/auth.route";
import { UserRoutes } from "../user/user.route";
import { CategoryRoutes } from "../category/category.route";
import { ServiceRoutes } from "../service/service.route";

const router = Router();

router.use("/api/auth", AuthRoutes);
router.use("/api/users", UserRoutes);
router.use("/api/categories", CategoryRoutes);
router.use("/api/services", ServiceRoutes);

export const AppRoutes = router;