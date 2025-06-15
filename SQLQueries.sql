CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT NOT NULL UNIQUE, 
    email TEXT NOT NULL UNIQUE, 
    password TEXT NOT NULL
);

CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    image_path TEXT,
    created_at INTEGER
);


CREATE TABLE banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT,
    id_news INTEGER,
    title TEXT,
    subtitle TEXT,
    FOREIGN KEY (id_news) REFERENCES news(id) ON DELETE CASCADE
);

CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT,
    content TEXT,
    image_path TEXT
);

