export interface ThreadPageDto {
  page: number;
  threads: ThreadDto[];
}

export interface ThreadDto {
  no: number;
  last_modified: number;
  replies: number;
}
