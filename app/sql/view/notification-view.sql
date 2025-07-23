-- user_notifications + sender/receiver username join view
CREATE OR REPLACE VIEW notification_view AS
SELECT
    n.*,
    sender.username AS sender_name,
    receiver.username AS receiver_name
FROM
    user_notifications n
    LEFT JOIN users_view sender ON n.sender_id = sender.profile_id
    LEFT JOIN users_view receiver ON n.receiver_id = receiver.profile_id;