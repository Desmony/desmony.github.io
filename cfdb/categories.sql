CREATE TABLE categories (
    category VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO categories (category, name)
VALUES  ('object',            'Object'),
        ('furniture',         'Furniture'),
        ('cinema',            'Cinema'),
        ('movie',             'Movie'),
        ('geography',         'Geography'),
        ('geography_europe',  'European Geography'),
        ('physical_geography',    'Physical Geography'),
        ('people',            'People'),
        ('architecture',      'Architecture'),
        ('people_internet',   'Internet Celebrities'),
        ('politician',        'Politician'),
        ('artist',            'Artist'),
        ('lifestyle',         'Lifestyle'),
        ('religion_myth',     'Religion & Mythology'),
        ('politics',          'Politics'),
        ('anthropology',      'Anthropology'),
        ('technology',        'Technology'),
        ('fictional_character',   'Fictional Character'),
        ('literature',        'Literature'),
        ('art',               'Visual Arts'),
        ('music',             'Music'),
        ('sport',             'Sports'),
        ('gastronomy',        'Gastronomy'),
        ('animal',            'Animal'),
        ('science',           'Science'),
        ('country',           'Country');

CREATE TABLE category_relations (
    parent_category VARCHAR(255) NOT NULL,
    child_category VARCHAR(255) NOT NULL,
    PRIMARY KEY (parent_category, child_category),
    FOREIGN KEY (parent_category) REFERENCES categories(category),
    FOREIGN KEY (child_category) REFERENCES categories(category),
    CHECK (parent_category <> child_category)
);

INSERT INTO category_relations (parent_category, child_category)
VALUES  ('object',    'furniture'),
        ('cinema',    'movie'),
        ('geography', 'geography_europe'),
        ('geography', 'physical_geography'),
        ('people',    'people_internet'),
        ('people',    'politician'),
        ('people',    'artist'),
        ('politics',  'politician'),
        ('art',       'artist'),
        ('geography', 'country');