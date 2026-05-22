import { pool } from "../../db";
import attachReporterToIssues from "../../utils/issueWithReporter";
import type { TIssue } from "./issues.interface";

const createIssuesFromDB = async (issues: TIssue, reporterId: number) => {
    try {
        const { title, description, type } = issues;

        // console.log({ title, description, type })

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

const getAllIssuesFromDB = async (query: any) => {

    const { sort, type, status } = query;

    let sql = `SELECT * FROM issues WHERE 1=1`;

    const values: any[] = [];
    let count = 1;

    if (type) {
        sql += ` AND type = $${count}`;
        values.push(type);
        count++;
    }

    if (status) {
        sql += ` AND status = $${count}`;
        values.push(status);
        count++;
    }

    if (sort === "oldest") {
        sql += ` ORDER BY created_at ASC`;
    } else {
        sql += ` ORDER BY created_at DESC`;
    }

    const allIssues = await pool.query(sql, values);

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

        const retrieveIssuesData = attachReporterToIssues(rest, reporter);

        return retrieveIssuesData;
    });

    return issuesWithReporter;
};

const getSingleIssueFromDB = async (id: string) => {
    // console.log(id)
    try {
        const result = await pool.query(
            `SELECT * FROM issues WHERE id=$1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new Error("issue not found..!")
        }

        const reporterUser = await pool.query(`
            SELECT id, name, role FROM users WHERE id = $1`,
            [result.rows[0].reporter_id]
        );

        // console.log(result.rows, reporterUser.rows);

        const issue = result.rows[0]
        const reporter = reporterUser.rows[0]

        // console.log(issue, reporter)

        const retrieveIssuesData = attachReporterToIssues(issue, reporter)

        return retrieveIssuesData;

    } catch (error: any) {
        throw new Error(error.message)
    }
}

const updateSingleIssueFromDB = async (id: string, payload: {
    title: string; description: string; type: string;
}) => {

    try {
        const { title, description, type } = payload;
        const result = await pool.query(`
            UPDATE issues SET title = $1, description = $2,type = $3, updated_at = NOW() WHERE id = $4 RETURNING *
        `,
            [title, description, type, id]
        );

        return result.rows[0];

    } catch (error: any) {
        throw new Error(error.message);
    }

}

const deletedSingleIssueFromBD = async (id: string) => {
    const result = await pool.query(`
        DELETE FROM issues WHERE id = $1 RETURNING *`
        , [id]
    );

    if (result.rows.length === 0) {
        throw new Error("Issue not found");
    }

    return;
}

export const issuesService = {
    createIssuesFromDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateSingleIssueFromDB,
    deletedSingleIssueFromBD
}