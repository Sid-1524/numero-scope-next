CREATE TABLE IF NOT EXISTS numero_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_username TEXT NOT NULL,
  inputs JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT numero_history_inputs_object CHECK (jsonb_typeof(inputs) = 'object'),
  CONSTRAINT numero_history_result_object CHECK (jsonb_typeof(result) = 'object')
);

CREATE INDEX IF NOT EXISTS numero_history_owner_created_idx
  ON numero_history (owner_username, created_at DESC);
