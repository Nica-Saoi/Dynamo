-- Dynamo database
CREATE KEYSPACE IF NOT EXISTS dynamo
WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'replication_factor': 1
};

USE dynamo;

-- Registered users
CREATE TABLE IF NOT EXISTS users_by_id (
    user_id UUID PRIMARY KEY,
    author_id UUID,
    username TEXT,
    email TEXT,
    password_hash TEXT,
    created_at TIMESTAMP
);

-- Authors, including those without accounts
CREATE TABLE IF NOT EXISTS authors_by_id (
    author_id UUID PRIMARY KEY,
    author_name TEXT,
    affiliation TEXT,
    orcid TEXT,
    biography TEXT
);

-- Research papers
CREATE TABLE IF NOT EXISTS papers_by_id (
    paper_id UUID PRIMARY KEY,
    title TEXT,
    abstract TEXT,
    doi TEXT,
    publication_date DATE,
    file_location TEXT,
    uploaded_by UUID,
    uploaded_at TIMESTAMP
);

-- Papers associated with each author
CREATE TABLE IF NOT EXISTS papers_by_author (
    author_id UUID,
    paper_id UUID,
    paper_title TEXT,
    author_position INT,
    PRIMARY KEY ((author_id), paper_id)
);

-- Authors associated with each paper
CREATE TABLE IF NOT EXISTS authors_by_paper (
    paper_id UUID,
    author_position INT,
    author_id UUID,
    author_name TEXT,
    PRIMARY KEY ((paper_id), author_position)
);