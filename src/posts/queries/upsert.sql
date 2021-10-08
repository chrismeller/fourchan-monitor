insert into posts (board, comment, created_at, file_extension, file_hash, file_height, file_size, file_uploaded, file_width, filename, number, posters_name, thread, url_slug, replies, image_replies, unique_ips)
values ( @Board, @Comment, @CreatedAt, @FileExtension, @FileHash, @FileHeight, @FileSize, @FileUploaded, @FileWidth, @Filename, @Number, @PostersName, @Thread, @UrlSlug, @Replies, @ImageReplies, @UniqueIps )
on conflict (board, thread, number) do update set replies = excluded.replies, image_replies = excluded.image_replies, unique_ips = excluded.unique_ips;
