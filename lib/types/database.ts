export type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  category_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  categories: Pick<Category, "name"> | null;
};

export type TodayMessage = {
  id: string;
  body: string;
  display_date: string;
  updated_at: string;
};

export type Memory = {
  id: string;
  caption: string;
  photo_url: string | null;
  memory_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Like = {
  id: string;
  body: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Diary = {
  id: string;
  title: string;
  body: string;
  diary_date: string;
  created_at: string;
  updated_at: string;
};

export type Novel = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type AccessLog = {
  id: string;
  page_type: string;
  content_id: string | null;
  content_title: string | null;
  accessed_at: string;
  updated_at: string;
};

export type MessageWithTags = Message & {
  message_tags: Array<{ tag_id: string; tags: Pick<Tag, "name"> | null }>;
};

export type CategoryWithCount = Category & { count: number };

export type TagWithCount = Tag & { count: number };
