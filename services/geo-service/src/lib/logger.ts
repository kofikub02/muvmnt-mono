import { winstonLogger } from "@repo/lib";
import { appConfig } from "../app-config";


const logger = winstonLogger(appConfig.APP_ID);

export default logger;
