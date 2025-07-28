-- user_notifications + sender/receiver username join view
CREATE OR REPLACE VIEW notification_view
with (security_invoker = true) AS
SELECT
    n.*,
    sender.username AS sender_name,
    receiver.username AS receiver_name
FROM
    user_notifications n
    LEFT JOIN user_profiles sender ON n.sender_id = sender.profile_id
    LEFT JOIN user_profiles receiver ON n.receiver_id = receiver.profile_id;