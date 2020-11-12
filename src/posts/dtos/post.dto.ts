interface Post {
  no: number;
  name: string;
  com: string;
  filename: string;
  ext: string;
  w: number;
  h: number;
  tim: number;
  time: number;
  md5: string;
  fsize: number;
  semantic_url: string;
}

interface PostsWrapper {
  posts: Array<Post>;
}

export { Post, PostsWrapper };
