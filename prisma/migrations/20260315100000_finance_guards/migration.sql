ALTER TABLE "posting"
ADD CONSTRAINT "posting_amount_positive_check" CHECK ("amountMinor" > 0);

ALTER TABLE "transfer_request"
ADD CONSTRAINT "transfer_request_amount_positive_check" CHECK ("amountMinor" > 0);

CREATE OR REPLACE FUNCTION prevent_append_only_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only. Use compensating records instead of updates/deletes.', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER journal_entry_append_only
BEFORE UPDATE OR DELETE ON "journal_entry"
FOR EACH ROW
EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER posting_append_only
BEFORE UPDATE OR DELETE ON "posting"
FOR EACH ROW
EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER audit_event_append_only
BEFORE UPDATE OR DELETE ON "audit_event"
FOR EACH ROW
EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER external_transfer_event_append_only
BEFORE UPDATE OR DELETE ON "external_transfer_event"
FOR EACH ROW
EXECUTE FUNCTION prevent_append_only_mutation();
