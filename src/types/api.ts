// 4chan API Types
// Based on https://github.com/4chan/4chan-API

export interface Board {
    board: string;
    title: string;
    ws_board: number; // worksafe
    per_page: number;
    pages: number;
    max_filesize: number;
    max_webm_filesize: number;
    max_comment_chars: number;
    max_webm_duration: number;
    bump_limit: number;
    image_limit: number;
    cooldowns?: {
        threads: number;
        replies: number;
        images: number;
    };
    meta_description?: string;
    spoilers?: number;
    custom_spoilers?: number;
    is_archived?: number;
    board_flags?: Record<string, string>;
    country_flags?: number;
    user_ids?: number;
    oekaki?: number;
    sjis_tags?: number;
    code_tags?: number;
    math_tags?: number;
    text_only?: number;
    forced_anon?: number;
    webm_audio?: number;
    require_subject?: number;
    min_image_width?: number;
    min_image_height?: number;
}

export interface BoardList {
    boards: Board[];
}

export interface Post {
    no: number;
    resto: number; // 0 for OP
    sticky?: number;
    closed?: number;
    now: string;
    time: number;
    name?: string;
    trip?: string;
    id?: string;
    capcode?: string;
    country?: string;
    country_name?: string;
    sub?: string; // subject
    com?: string; // HTML comment
    tim?: number; // renamed filename
    filename?: string;
    ext?: string; // .jpg, .png, .gif, .webm
    fsize?: number;
    md5?: string;
    w?: number; // image width
    h?: number; // image height
    tn_w?: number; // thumbnail width
    tn_h?: number; // thumbnail height
    filedeleted?: number;
    spoiler?: number;
    custom_spoiler?: number;
    omitted_posts?: number;
    omitted_images?: number;
    replies?: number;
    images?: number;
    bumplimit?: number;
    imagelimit?: number;
    capcode_replies?: Record<string, number>;
    last_modified?: number;
    tag?: string;
    semantic_url?: string;
    since4pass?: number;
    unique_ips?: number;
    m_img?: number; // mobile optimized image
    archived?: number;
    archived_on?: number;
}

export interface Thread {
    posts: Post[];
}

export interface CatalogThread {
    no: number;
    last_modified: number;
    replies: number;
    images: number;
    page?: number;
    sub?: string;
    com?: string;
    tim?: number;
    filename?: string;
    ext?: string;
    w?: number;
    h?: number;
    tn_w?: number;
    tn_h?: number;
    sticky?: number;
    closed?: number;
    archived?: number;
    bumplimit?: number;
    imagelimit?: number;
    semantic_url?: string;
    unique_ips?: number;
    teaser?: string;
}

export interface CatalogPage {
    page: number;
    threads: CatalogThread[];
}

export type Catalog = CatalogPage[];

export interface Archive {
    archives: number[];
}
