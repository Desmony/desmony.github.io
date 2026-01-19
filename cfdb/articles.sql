CREATE TABLE articles (
    day INT,
    question INT,
    PRIMARY KEY (day, question),
    answer VARCHAR(255) NOT NULL
);

INSERT INTO articles (day, question, answer) 
VALUES  (575,   1,  'Resolute Desk'),
        (575,   2,  'Tombstone'),
        (575,   3,  'Triglav'),
        (575,   4,  'Alvar Aalto'),
        (575,   5,  'Tailgate party'),
        (575,   6,  'IShowSpeed'),
        (575,   7,  'Bashar al-Assad'),
        (575,   8,  'Horus'),
        (575,   9,  'Lasso'),
        (575,   10, 'Uyghurs'),
        (574,   1,  'Quine'),
        (574,   2,  'Charlie Brown'),
        (574,   3,  'How Green Was My Valley'),
        (574,   4,  'Whiplash'),
        (574,   5,  'Graffiti'),
        (574,   6,  'Saint Patrick'),
        (574,   7,  'Antonio Stradivari'),
        (574,   8,  'Wife-carrying'),
        (574,   9,  'Blu-ray'),
        (574,   10, 'Hokusai');
