import pg from 'pg'

const { Pool } = pg

// Railway inyecta DATABASE_URL al linkear el servicio de Postgres.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id            SERIAL PRIMARY KEY,
      nombre        TEXT NOT NULL,
      email         TEXT,
      telefono      TEXT,
      proyecto      TEXT,
      monto_mensual NUMERIC(12,2) DEFAULT 0,
      estado        TEXT NOT NULL DEFAULT 'activo',
      notas         TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cobros (
      id            SERIAL PRIMARY KEY,
      cliente_id    INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      periodo       TEXT NOT NULL,
      monto         NUMERIC(12,2) NOT NULL DEFAULT 0,
      estado        TEXT NOT NULL DEFAULT 'pendiente',
      fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
      fecha_pago    DATE,
      notas         TEXT,
      UNIQUE (cliente_id, periodo)
    );
  `)

  console.log('[db] tablas listas')
}
