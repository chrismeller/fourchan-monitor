create table posts (
    board nvarchar(50) not null,
    comment text,
    created_at datetime,
    file_extension nvarchar(25),
    file_hash nvarchar(128),
    file_height int,
    file_size int,
    file_uploaded datetime,
    file_width int,
    filename nvarchar(250),
    number bigint,
    posters_name nvarchar(128),
    thread bigint,
    url_slug nvarchar(128),
    replies int,
    image_replies int,
    unique_ips int,
    primary key (board, thread, number)
);

create index idx_posts_board on posts (board);
