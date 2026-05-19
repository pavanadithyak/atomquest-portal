require("dotenv").config({ path: "../.env" });
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || "atomquest",
  process.env.POSTGRES_USER || "postgres",
  process.env.POSTGRES_PASSWORD || "change_me",
  {
    host: process.env.POSTGRES_HOST || "postgres",
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    dialect: "postgres",
    logging: console.log,
  }
);

async function seed() {
  try {
    console.log("Starting database seed...");

    console.log("Dropping old tables...");
    await sequelize.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS check_ins CASCADE;
      DROP TABLE IF EXISTS achievements CASCADE;
      DROP TABLE IF EXISTS goals CASCADE;
      DROP TABLE IF EXISTS goal_sheets CASCADE;
      DROP TABLE IF EXISTS cycles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `, { raw: true });
    console.log("Old tables dropped");

    console.log("Creating schema...");
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "../migrations/001_create_schema.sql"),
      "utf8"
    );
    await sequelize.query(schemaSQL, { raw: true });
    console.log("Schema created");

    console.log("Seeding data...");
    const seedSQL = fs.readFileSync(
      path.join(__dirname, "../migrations/002_seed_data.sql"),
      "utf8"
    );
    await sequelize.query(seedSQL, { raw: true });
    console.log("Data seeded");

    const [users] = await sequelize.query(
      "SELECT COUNT(*)::int as count FROM users",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [goals] = await sequelize.query(
      "SELECT COUNT(*)::int as count FROM goals",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [achievements] = await sequelize.query(
      "SELECT COUNT(*)::int as count FROM achievements",
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.log(`Users: ${users.count}, Goals: ${goals.count}, Achievements: ${achievements.count}`);

    await sequelize.close();
    console.log("Database ready!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
