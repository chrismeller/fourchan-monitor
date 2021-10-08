create table threads (
    board nvarchar(5) not null,
    number bigint not null,
    etag nvarchar(50) null,
    last_modified datetime null,
    primary key (board, number)
);

create index idx_threads_board on threads (board);
