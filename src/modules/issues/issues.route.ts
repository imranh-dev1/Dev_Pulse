import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";
import checkIssuePermission from "../../middleware/checkIssuePermission";
import checkMaintainer from "../../middleware/checkMaintainer";

const router = Router()

router.post("/", auth(), issuesController.createIssue)
router.get("/", issuesController.getAllIssues)
router.get("/:id", issuesController.getSingleIssue)
router.patch("/:id", auth(), checkIssuePermission(), issuesController.updateSingleIssue)
router.delete("/:id", auth(), checkMaintainer(), issuesController.deletedSingleIssue)


export const issuesRoute = router;
