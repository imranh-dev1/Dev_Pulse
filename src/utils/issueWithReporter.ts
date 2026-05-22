import type { TIssue } from "../modules/issues/issues.interface";
import type { Treporter } from "../types/reporter";

const attachReporterToIssue = (issue: TIssue & { id: number }, reporter: Treporter) => {
    const retrieveIssuesData = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: {
            id: reporter.id,
            name: reporter.name,
            role: reporter.role,
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    }

    return retrieveIssuesData
}

export default attachReporterToIssue;