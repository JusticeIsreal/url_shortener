
import { PostgresDb } from '@fastify/postgres'
import { v4 as uuidv4 } from "uuid";

interface UserCreateParams {
  username?: string;
  email?: string;
  password?: string;
  rank?: string;
}
const User = (pool: PostgresDb) => ( {
  // CREATE USER AND TO DATABASE
  async create({ username, email, password, rank }: UserCreateParams) {
    const id = uuidv4();
    const created_at = new Date();
    const query = `INSERT INTO users (id, username, password, email, rank, created_at) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, rank, created_at`;
    const { rows } = await pool.query(query, [
      id,
      username,
      password,
      email,
      rank,
      created_at,
    ]);
    return rows[0];
  },

  // FIND IF USER EXISTS IN DATABASE
  async findByemail(email: string) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);

    return rows[0];
  },

  // DELETE SINGLE USER & ITS ROW FROM THE DATABASE
  async deleteByEmail(email: string) {
    const query = `DELETE FROM users WHERE email = $1 RETURNING *`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },
});

export default User
