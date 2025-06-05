
CREATE OR REPLACE FUNCTION packet_capture()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
    payload JSON;
BEGIN
    payload := json_build_object(
        'source', NEW.source,
        'destination', NEW.destination,
        'protocol', NEW.protocol,
        'length', NEW.length,
        'flags', NEW.flags,
        'summary', NEW.summary,
        'email', NEW.email
    );

    PERFORM pg_notify('my_pcap_channelName', payload::TEXT);
    RETURN NEW;
END;
$$;

CREATE TRIGGER packet
AFTER INSERT
ON "packetDetails"
FOR EACH ROW
EXECUTE FUNCTION packet_capture();
