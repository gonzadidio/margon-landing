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
  // ---------- Clientes ----------
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

  // Columnas nuevas (idempotentes) — no rompen datos existentes.
  await pool.query(`
    ALTER TABLE clientes
      ADD COLUMN IF NOT EXISTS moneda     TEXT NOT NULL DEFAULT 'ARS',
      ADD COLUMN IF NOT EXISTS dia_cobro  INTEGER,
      ADD COLUMN IF NOT EXISTS sitio_url  TEXT,
      ADD COLUMN IF NOT EXISTS canal      TEXT,
      ADD COLUMN IF NOT EXISTS fecha_alta DATE;
  `)

  // ---------- Cobros ----------
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

  await pool.query(`
    ALTER TABLE cobros
      ADD COLUMN IF NOT EXISTS moneda      TEXT NOT NULL DEFAULT 'ARS',
      ADD COLUMN IF NOT EXISTS metodo_pago TEXT,
      ADD COLUMN IF NOT EXISTS vencimiento DATE,
      ADD COLUMN IF NOT EXISTS tipo        TEXT NOT NULL DEFAULT 'mensual',
      ADD COLUMN IF NOT EXISTS concepto    TEXT;
  `)

  // Antes: un único cobro por (cliente, período). Ahora eso solo aplica a los
  // cobros MENSUALES; los de tipo setup/único pueden repetirse en un mismo mes.
  await pool.query(`ALTER TABLE cobros DROP CONSTRAINT IF EXISTS cobros_cliente_id_periodo_key`)
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS cobros_mensual_periodo_uidx
      ON cobros (cliente_id, periodo) WHERE tipo = 'mensual'
  `)

  // ---------- Proyectos ----------
  // Un cliente puede tener varios proyectos, cada uno con su ciclo de vida.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS proyectos (
      id           SERIAL PRIMARY KEY,
      cliente_id   INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      nombre       TEXT NOT NULL,
      descripcion  TEXT,
      estado       TEXT NOT NULL DEFAULT 'desarrollo',
      stack        TEXT,
      repo_url     TEXT,
      deploy_url   TEXT,
      monto        NUMERIC(12,2) DEFAULT 0,
      moneda       TEXT NOT NULL DEFAULT 'ARS',
      fecha_inicio DATE,
      fecha_fin    DATE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  // ---------- Seguimientos / CRM ----------
  // Historial de interacciones y próximas acciones por cliente (y proyecto opcional).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS seguimientos (
      id            SERIAL PRIMARY KEY,
      cliente_id    INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      proyecto_id   INTEGER REFERENCES proyectos(id) ON DELETE SET NULL,
      tipo          TEXT NOT NULL DEFAULT 'nota',
      titulo        TEXT NOT NULL,
      detalle       TEXT,
      fecha         DATE NOT NULL DEFAULT CURRENT_DATE,
      proxima_accion TEXT,
      proxima_fecha  DATE,
      completado    BOOLEAN NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  // ---------- Pagos parciales (abonos) ----------
  // Un cobro puede pagarse en varias veces (seña + saldo, cuotas, etc.).
  // El estado del cobro se recalcula según la suma de estos pagos.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagos (
      id         SERIAL PRIMARY KEY,
      cobro_id   INTEGER NOT NULL REFERENCES cobros(id) ON DELETE CASCADE,
      monto      NUMERIC(12,2) NOT NULL DEFAULT 0,
      fecha      DATE NOT NULL DEFAULT CURRENT_DATE,
      metodo     TEXT,
      nota       TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  // Backfill: los cobros ya marcados 'pagado' (modelo viejo, sin abonos) se
  // convierten en un pago único por su monto total. Idempotente.
  await pool.query(`
    INSERT INTO pagos (cobro_id, monto, fecha, metodo)
    SELECT c.id, c.monto, COALESCE(c.fecha_pago, c.fecha_emision, CURRENT_DATE), c.metodo_pago
      FROM cobros c
     WHERE c.estado = 'pagado' AND c.monto > 0
       AND NOT EXISTS (SELECT 1 FROM pagos p WHERE p.cobro_id = c.id)
  `)

  // ---------- Archivos adjuntos ----------
  // Facturas, informes mensuales, contratos, etc. Se guardan en la misma base
  // (bytea) para no depender de disco ni de un servicio externo.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS archivos (
      id          SERIAL PRIMARY KEY,
      cliente_id  INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
      proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE SET NULL,
      categoria   TEXT NOT NULL DEFAULT 'otro',
      nombre      TEXT NOT NULL,
      mime        TEXT,
      tamano      INTEGER,
      datos       BYTEA NOT NULL,
      descripcion TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  console.log('[db] tablas listas')
}
