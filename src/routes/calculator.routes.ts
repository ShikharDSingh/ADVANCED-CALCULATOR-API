import { Router } from "express";
import { arithmeticController, chainController, evaluateController } from "../controllers/calculator.controller";
import { calculationRateLimiter } from "../middlewares/rate-limiter";
import { validateBody } from "../middlewares/validate-request";
import { binaryOperationSchema, chainSchema, evaluateSchema } from "../validators/calculator.validator";

const router = Router();
router.use(calculationRateLimiter);
router.post("/add", validateBody(binaryOperationSchema), arithmeticController("add"));
router.post("/subtract", validateBody(binaryOperationSchema), arithmeticController("subtract"));
router.post("/multiply", validateBody(binaryOperationSchema), arithmeticController("multiply"));
router.post("/divide", validateBody(binaryOperationSchema), arithmeticController("divide"));
router.post("/power", validateBody(binaryOperationSchema), arithmeticController("power"));
router.post("/modulo", validateBody(binaryOperationSchema), arithmeticController("modulo"));
router.post("/evaluate", validateBody(evaluateSchema), evaluateController);
router.post("/chain", validateBody(chainSchema), chainController);
export default router;
