import { Router } from "express";
import { AuthRoutes } from "./auth.route";

const router = Router();

const moduleRoutes: Array<{
  path: string;
  route: Router;
}> = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export const AppRoutes = router;