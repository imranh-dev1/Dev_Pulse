import config from "../../config";
import { pool } from "../../db";
import type { TUsers } from "./auth.users.interface";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const signUpUsersFromDB = async (payload: TUsers) => {
    const { name, email, password, role } = payload;
    const passwordHash = await bcrypt.hash(password, 20);
    console.log(passwordHash)

    const emailAlreadyExists = await pool.query(`
        SELECT * FROM users WHERE email = $1;
    `, [email])

    if (emailAlreadyExists.rows.length > 0) {
        throw new Error("User email already exists. Please try another email signup.")
    }

    const result = await pool.query(
        `
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
         `,
        [name, email, passwordHash, role],
    );

    delete result.rows[0].password;
    return result;
}


const singInUsersFromDB = async (payload: { email: string, password: string }) => {
    const { email, password } = payload;

    const result = await pool.query(`
        SELECT * FROM users WHERE email = $1;
    `, [email])

    if (result.rows.length === 0) {
        throw new Error("User not found...!")
    }
     
    const user = result.rows[0];

    const matchPassword = await bcrypt.compare(password, user.password)

    if (!matchPassword) {
        throw new Error("Invalid email or password...!")
    }
    const usersPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role

    }

    const accessToken = jwt.sign(usersPayload, config.jwt_secret, {
        expiresIn: "2d"
    })

    delete user.password;

    return {
        token: accessToken,
        user: user
    };

}

export const authService = {
    signUpUsersFromDB,
    singInUsersFromDB,
}