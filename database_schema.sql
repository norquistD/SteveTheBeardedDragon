CREATE TABLE IF NOT EXISTS domes (
    dome_id BIGSERIAL PRIMARY KEY,
    dome_name VARCHAR(255) NOT NULL,
    dome_image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tours (
    tour_id BIGSERIAL PRIMARY KEY,
    tour_name VARCHAR(255) NOT NULL,
    tour_description TEXT NOT NULL,
    tour_path_image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
    location_id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT REFERENCES tours(tour_id) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL
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
            AND (
                content_id_left IS NOT NULL 
                OR content_id_right IS NOT NULL
            )
        )
    )
);

CREATE TABLE IF NOT EXISTS plants (
    plant_id BIGSERIAL PRIMARY KEY,
    plant_name VARCHAR(255) NOT NULL,
    plant_scientific_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS plant_blocks (
    block_id BIGSERIAL PRIMARY KEY,
    content_id_left BIGINT REFERENCES contents(content_id) DEFAULT NULL,
    content_id_right BIGINT REFERENCES contents(content_id) DEFAULT NULL,
    plant_id BIGINT REFERENCES plants(plant_id) NOT NULL,
    position INTEGER -- NULL = Plant Name/Scientific Name, 0-99 = CONTENT BLOCKS
);