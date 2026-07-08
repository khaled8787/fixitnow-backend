import { Router } from "express";
import { AuthRoutes } from "../auth/auth.route";
import { UserRoutes } from "../user/user.route";
import { CategoryRoutes } from "../category/category.route";
import { ServiceRoutes } from "../service/service.route";

const router = Router();

const moduleRoutes: Array<{
  path: string;
  route: Router;
}> = [
  {
    path: "/api/auth",
    route: AuthRoutes,
  },
  {
    path: "/api/users",
    route: UserRoutes,
  },
  {
    path: "/api/categories",
    route: CategoryRoutes,
  },
  {
    path: "/api/services",
    route: ServiceRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export const AppRoutes = router;