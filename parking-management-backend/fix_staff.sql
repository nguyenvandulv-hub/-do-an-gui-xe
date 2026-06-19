UPDATE parking_record_history 
SET staff_in = (SELECT account_id FROM account WHERE role = 'STAFF' LIMIT 1), 
    staff_out = (SELECT account_id FROM account WHERE role = 'STAFF' LIMIT 1) 
WHERE staff_in = (SELECT account_id FROM account WHERE username = 'admin');
