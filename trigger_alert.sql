
CREATE OR REPLACE FUNCTION log_alert_changes()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
    payload JSON;
BEGIN
    payload := json_build_object(
        'alert_type', NEW.alert_type,
        'severity', NEW.severity,
        'description', NEW.description,
		'created_at', NEW.created_at
    );

    PERFORM pg_notify('my_alert_channelName', payload::TEXT);
    RETURN NEW;
END;
$$;

CREATE TRIGGER packet
AFTER INSERT
ON "alerts"
FOR EACH ROW
EXECUTE FUNCTION log_alert_changes();
