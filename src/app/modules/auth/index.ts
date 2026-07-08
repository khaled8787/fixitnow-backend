import { Router } from "express";
import { AuthRoutes } from "../../modules/auth/auth.route";
import { UserRoutes } from "../../modules/user/user.route";

const router = Router();

const moduleRoutes: Array<{
  path: string;
  route: Router;
}> = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export const AppRoutes = router;