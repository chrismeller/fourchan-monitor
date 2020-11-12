create table threads (
    board nvarchar(5) not null,
    number bigint not null,
    etag nvarchar(50) null,
    last_modified bigint null,
    primary key (board, number)
);