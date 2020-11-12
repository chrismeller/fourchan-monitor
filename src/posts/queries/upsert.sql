insert into posts (board, comment, created_at, file_extension, file_hash, file_height, file_size, file_uploaded, file_width, filename, number, posters_name, thread, url_slug)
values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
on conflict (board, thread, number) do nothing;