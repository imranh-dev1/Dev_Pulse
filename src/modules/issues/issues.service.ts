import type { TIssue } from "./issues.interface";

const createIssuesFromDB = (issues: TIssue) => {
    try {
        console.log(issues)
    } catch (error) {

    }
}


export const issuesService = {
    createIssuesFromDB,
}