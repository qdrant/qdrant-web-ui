import { apiRoutes } from "./api";
import { appRoutes } from "./app";
import { browserRoutes } from "./routes";

export const routes = {
  api: apiRoutes,
  app: appRoutes,
  components: browserRoutes,
};
