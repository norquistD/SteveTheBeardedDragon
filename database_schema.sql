CREATE TABLE IF NOT EXISTS domes (
    dome_id BIGSERIAL PRIMARY KEY,
    dome_name VARCHAR(255) NOT NULL,
    dome_image_url TEXT NOT NULL,
    dome_path_image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
    location_id BIGSERIAL PRIMARY KEY,
    dome_id BIGINT REFERENCES domes(dome_id) NOT NULL,
    location_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS languages (
    language_id BIGSERIAL PRIMARY KEY,
    language_code VARCHAR(3) NOT NULL,
    language_name TEXT NOT NULL,
    language_native_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contents (
    content_id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    is_url BOOLEAN NOT NULL DEFAULT FALSE,
    language_id BIGINT REFERENCES languages(language_id) NOT NULL
);

CREATE TABLE IF NOT EXISTS blocks (
    block_id BIGSERIAL PRIMARY KEY,
    content_id_left BIGINT REFERENCES contents(content_id) DEFAULT NULL,
    content_id_right BIGINT REFERENCES contents(content_id) DEFAULT NULL,
    location_id BIGINT REFERENCES locations(location_id) NOT NULL,
    position INTEGER, -- NULL = TITLE, 0-99 = CONTENT BLOCK
    CONSTRAINT check_position CHECK (
        (
            position IS NOT NULL 
            AND (
                content_id_left IS NOT NULL 
                OR content_id_right IS NOT NULL
            )
        ) 
        OR (
            position IS NULL 
            AND content_id_left IS NOT NULL 
            AND content_id_right IS NOT NULL
        )
    )
);

