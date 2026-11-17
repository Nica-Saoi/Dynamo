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

-- Authors associated with each user
CREATE TABLE IF NOT EXISTS authors_by_user (
    user_id UUID,
    author_id UUID,
    PRIMARY KEY ((user_id), author_id)
);

--Authors by name for search functionality
CREATE TABLE IF NOT EXISTS authors_by_name (
    author_name_normalized TEXT,
    author_id UUID,
    author_name TEXT,
    affiliation TEXT,
    orcid TEXT,
    PRIMARY KEY ((author_name_normalized), author_id)
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

-- Papers by title for search functionality
CREATE TABLE IF NOT EXISTS papers_by_title (
    title_normalized TEXT,
    paper_id UUID,
    title TEXT,
    abstract TEXT,
    doi TEXT,
    publication_date DATE,
    PRIMARY KEY ((title_normalized), paper_id)
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

-- Artifacts associated with each paper
CREATE TABLE IF NOT EXISTS artifacts_by_paper (
    paper_id UUID,
    artifact_id UUID,
    artifact_name TEXT,
    artifact_type TEXT,
    artifact_description TEXT,
    PRIMARY KEY ((paper_id), artifact_id)
);

-- Artifacts by id for retrieval
CREATE TABLE IF NOT EXISTS artifacts_by_id (
    artifact_id UUID PRIMARY KEY,
    artifact_name TEXT,
    artifact_type TEXT,
    artifact_description TEXT,
    file_format TEXT,
    file_size BIGINT,
    paper_id UUID,
    file_location TEXT,
    uploaded_by UUID,
    uploaded_at TIMESTAMP,
    license TEXT,
    version TEXT
);

--Docker images by artifact id for retrieval
CREATE TABLE IF NOT EXISTS environments_by_artifact (
    artifact_id UUID,
    environment_id UUID,
    docker_image TEXT,
    dockerfile_location TEXT,
    execution_command TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY ((artifact_id), environment_id)
);

-- Files by id for retrieval
CREATE TABLE IF NOT EXISTS files_by_id (
    file_id UUID PRIMARY KEY,
    original_filename TEXT,
    storage_key TEXT,
    content_type TEXT,
    file_size BIGINT,
    checksum_sha256 TEXT,
    uploaded_at TIMESTAMP
);

-- Files associated with research papers
CREATE TABLE IF NOT EXISTS files_by_paper (
    paper_id UUID,
    file_id UUID,
    file_role TEXT,
    PRIMARY KEY ((paper_id), file_id)
);

-- Files associated with research artifacts
CREATE TABLE IF NOT EXISTS files_by_artifact (
    artifact_id UUID,
    file_id UUID,
    PRIMARY KEY ((artifact_id), file_id)
);