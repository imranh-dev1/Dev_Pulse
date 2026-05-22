
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connection_string: process.env.CONNECTION_STRING,
  jwt_secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER NOT NULL,   
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  console.log("Database connected successfully!");
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var signUpUsersFromDB = async (payload) => {
  const { name, email, password, role } = payload;
  const passwordHash = await bcrypt.hash(password, 20);
  console.log(passwordHash);
  const emailAlreadyExists = await pool.query(`
        SELECT * FROM users WHERE email = $1;
    `, [email]);
  if (emailAlreadyExists.rows.length > 0) {
    throw new Error("User email already exists. Please try another email signup.");
  }
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
         `,
    [name, email, passwordHash, role]
  );
  delete result.rows[0].password;
  return result;
};
var singInUsersFromDB = async (payload) => {
  const { email, password } = payload;
  const result = await pool.query(`
        SELECT * FROM users WHERE email = $1;
    `, [email]);
  if (result.rows.length === 0) {
    throw new Error("User not found...!");
  }
  const user = result.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid email or password...!");
  }
  const usersPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt.sign(usersPayload, config_default.jwt_secret, {
    expiresIn: "2d"
  });
  delete user.password;
  return {
    token: accessToken,
    user
  };
};
var authService = {
  signUpUsersFromDB,
  singInUsersFromDB
};

// src/modules/auth/auth.controller.ts
var signUpUsers = async (req, res) => {
  try {
    const result = await authService.signUpUsersFromDB(req.body);
    res.status(201).json({
      "success": true,
      "message": "User registered successfully",
      "data": result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
  ;
};
var signInUsers = async (req, res) => {
  try {
    const result = await authService.singInUsersFromDB(req.body);
    res.status(200).json({
      success: true,
      message: "User signIn successfully...!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signUpUsers,
  signInUsers
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signUpUsers);
router.post("/login", authController.signInUsers);
var authRoute = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssuesFromDB = async (issues, reporterId) => {
  try {
    const { title, description, type } = issues;
    console.log({ title, description, type });
    const userExists = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [reporterId]
    );
    if (userExists.rows.length === 0) {
      throw new Error("User not found");
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
};
var getAllIssuesFromDB = async (query) => {
  const { sort, type, status } = query;
  let sql = `SELECT * FROM issues WHERE 1=1`;
  const values = [];
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
    return {
      ...rest,
      reporter
    };
  });
  return issuesWithReporter;
};
var getSingleIssueFromDB = async (id) => {
  try {
    const result = await pool.query(
      `SELECT * FROM issues WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("issue not found..!");
    }
    delete result.rows[0].password;
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};
var updateSingleIssueFromDB = async (id, payload) => {
  try {
    const { title, description, type } = payload;
    const result = await pool.query(
      `
            UPDATE issues SET title = $1, description = $2,type = $3, updated_at = NOW() WHERE id = $4 RETURNING *
        `,
      [title, description, type, id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};
var deletedSingleIssueFromBD = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
var issuesService = {
  createIssuesFromDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateSingleIssueFromDB,
  deletedSingleIssueFromBD
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  const reporterId = req.user?.id;
  try {
    const result = await issuesService.createIssuesFromDB(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Created Issue successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.getSingleIssueFromDB(id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var updateSingleIssue = async (req, res) => {
  const id = req.params.id;
  const updatedPayload = req.body;
  try {
    const result = await issuesService.updateSingleIssueFromDB(id, updatedPayload);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var deletedSingleIssue = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await issuesService.deletedSingleIssueFromBD(id);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateSingleIssue,
  deletedSingleIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access"
        });
        return;
      }
      const decoded = jwt2.verify(token, config_default.jwt_secret);
      const usersData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
            `,
        [decoded.email]
      );
      if (usersData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found..!"
        });
        return;
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/middleware/checkIssuePermission.ts
import "jsonwebtoken";
var checkIssuePermission = () => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const issueId = req.params.id;
      const issueResult = await pool.query(
        ` SELECT * FROM issues WHERE id = $1`,
        [issueId]
      );
      if (issueResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Issue not found"
        });
      }
      const issue = issueResult.rows[0];
      if (user?.role === "maintainer") {
        return next();
      }
      if (user?.role === "contributor" && issue.reporter_id === user.id && issue.status === "open") {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    } catch (error) {
      next(error);
    }
    ;
  };
};
var checkIssuePermission_default = checkIssuePermission;

// src/middleware/checkMaintainer.ts
var checkMaintainer = () => {
  return (req, res, next) => {
    const user = req.user;
    if (user?.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }
    next();
  };
};
var checkMaintainer_default = checkMaintainer;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issuesController.createIssue);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch("/:id", auth_default(), checkIssuePermission_default(), issuesController.updateSingleIssue);
router2.delete("/:id", auth_default(), checkMaintainer_default(), issuesController.deletedSingleIssue);
var issuesRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send({
    server: "Dev_Pulse",
    description: "Internal Tech Issue & Feature Tracker, A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions."
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map