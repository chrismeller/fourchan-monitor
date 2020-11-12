interface BoardsResponseDto {
    boards: Array<BoardDto>;
}

interface BoardDto {
    board: string;
    title: string;
    is_archived: boolean;
    meta_description: string;
}

export type { BoardDto, BoardsResponseDto };