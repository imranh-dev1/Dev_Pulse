import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";
import checkIssuePermission from "../../middleware/checkIssuePermission";

const router = Router()

router.post("/", auth(), issuesController.createIssue)
router.get("/", issuesController.getAllIssues)
router.get("/:id", issuesController.getSingleIssue)
router.patch("/:id", auth(), checkIssuePermission(), issuesController.updateSingleIssue)


export const issuesRoute = router;
