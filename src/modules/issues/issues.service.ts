import { pool } from "../../db";
import type { TIssue } from "./issues.interface";

const createIssuesFromDB = async (issues: TIssue, reporterId: number) => {
    try {
        const { title, description, type } = issues;

        console.log({ title, description, type })

        const userExists = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [reporterId]
        );

        if (userExists.rows.length === 0) {
            throw new Error("User not found")
        }

        const result = await pool.query(
            `
            INSERT INTO issues (title, description, type, reporter_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [title, description, type, reporterId]
        );

        return result.rows[0];
    } catch (error) {

    }
}

const getAllIssuesFromDB = async () => {
    const allIssues = await pool.query(`
        SELECT * FROM issues
    `);

    const reporterIds = allIssues.rows.map(
        (issue) => issue.reporter_id
    );

    if (reporterIds.length === 0) {
        return [];
    }

    const allReporterUsers = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id = ANY($1)
        `,
        [reporterIds]
    );

    const issuesWithReporter = allIssues.rows.map((issue) => {

        const reporter = allReporterUsers.rows.find(
            (user) => user.id === issue.reporter_id
        );

        const { reporter_id, ...rest } = issue;

        return {
            ...rest,
            reporter
        };
    });

    return issuesWithReporter;
};

export const issuesService = {
    createIssuesFromDB,
    getAllIssuesFromDB
}