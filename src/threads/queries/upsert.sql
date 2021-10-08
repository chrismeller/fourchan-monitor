insert into threads (board, number, etag, last_modified) values ( @board, @number, @etag, @last_modified )
on conflict (board, number) do update set etag = excluded.etag, last_modified = excluded.last_modified;
