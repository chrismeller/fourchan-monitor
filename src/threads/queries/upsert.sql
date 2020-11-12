insert into threads (board, number, etag, last_modified) values ( ?, ?, ?, ? ) 
on conflict (board, number) do update set etag = excluded.etag, last_modified = excluded.last_modified;