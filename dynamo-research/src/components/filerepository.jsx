import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { uploadFile } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/filerepository.css'

function FileRepository() {
    const { user, isAuthenticated, loading } = useAuth()

    return (
        <RepositoryContent
            key={user?.user_id || 'guest'}
            user={user}
            isAuthenticated={isAuthenticated}
            loading={loading}
        />
    )
}

function RepositoryContent({ user, isAuthenticated, loading }) {

    const [showUpload, setShowUpload] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [uploadedCount, setUploadedCount] = useState(0)

    const fileInput = useRef(null)

    function selectFiles(files) {
        if (uploading || !isAuthenticated) return

        setUploadError(null)

        const newFiles = Array.from(files)

        if (newFiles.some(file => file.type !== 'application/pdf')) {
            setUploadError('Only PDF files are currently supported.')
            return
        }

        setSelectedFiles(newFiles)
    }

    async function handleUpload() {

        if (!isAuthenticated || uploading) return
        if (selectedFiles.length === 0) return

        setUploading(true)
        setUploadError(null)
        setUploadSuccess(false)

        try {
            for (const file of selectedFiles) {

                const result = await uploadFile(file)

                setUploadedFiles(prev => [
                    ...prev,
                    result
                ])

                setUploadedCount(prev => prev + 1)

                setSelectedFiles(prev =>
                    prev.filter(item => item !== file)
                )
            }

            setUploadSuccess(true)

        } catch (error) {
            setUploadError(error.message)

        } finally {
            setUploading(false)
        }
    }

    function openUpload() {
        if (!isAuthenticated || loading) return

        setSelectedFiles([])
        setUploadError(null)
        setUploadSuccess(false)
        setUploadedCount(0)
        setShowUpload(true)
    }

    function closeUpload() {

        if (uploading) return

        setShowUpload(false)
        setSelectedFiles([])
        setUploadSuccess(false)
        setUploadError(null)
        setUploadedCount(0)

        if (fileInput.current) {
            fileInput.current.value = ''
        }
    }

    function handleDrop(event) {
        event.preventDefault()
        selectFiles(event.dataTransfer.files)
    }

    return (
        <div className="fileRepository">

            <h1>File Repository</h1>

            <p>
                Manage your published paper and
                supporting research files.
            </p>

            {loading ? (
                <p>Checking authentication...</p>
            ) : isAuthenticated ? (
                <p>
                    Signed in as: <strong>{user.username}</strong>
                </p>
            ) : (
                <p>
                    Please <Link to="/login">log in</Link> to
                    upload research files.
                </p>
            )}

            <hr />

            <h2>Published Paper</h2>

            <div className="publishedPaper">
                <div>
                    <h3>Research_Paper.pdf</h3>
                    <p>Published research paper - PDF</p>
                </div>

                <button type="button" disabled>
                    View Paper
                </button>
            </div>

            <h2>Supporting Research Files</h2>

            <button
                type="button"
                className="addFilesButton"
                onClick={openUpload}
                disabled={loading || !isAuthenticated}
            >
                + Add Files
            </button>

            <table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>File Type</th>
                        <th>Size</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {uploadedFiles.length === 0 ? (
                        <tr>
                            <td colSpan={4}>
                                No files uploaded during this visit.
                            </td>
                        </tr>
                    ) : (
                        uploadedFiles.map(file => (
                            <tr key={file.file_id}>

                                <td>{file.filename}</td>

                                <td>
                                    {file.filename
                                        .split('.')
                                        .pop()
                                        .toUpperCase()}
                                </td>

                                <td>
                                    {(file.size / 1024).toFixed(2)} KB
                                </td>

                                <td>
                                    <a href={`/api/files/${file.file_id}`}>
                                        Download
                                    </a>
                                </td>

                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {showUpload && isAuthenticated && (
                <div className="uploadOverlay">
                    <div className="uploadPopup">

                        {uploadSuccess ? (
                            <div className="successMessage">

                                <h2>Upload Successful!</h2>

                                <p>
                                    Your research files have been
                                    added successfully.
                                </p>

                                <div className="successBox">
                                    <h1>✓</h1>

                                    <p>
                                        {uploadedCount} file(s)
                                        successfully uploaded.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeUpload}
                                >
                                    Done
                                </button>

                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="closeUpload"
                                    onClick={closeUpload}
                                    disabled={uploading}
                                >
                                    ×
                                </button>

                                <h2>Add Research Files</h2>

                                <p>
                                    Uploading as: {user.username}
                                </p>

                                <div
                                    className="uploadArea"
                                    onDragOver={event =>
                                        event.preventDefault()
                                    }
                                    onDrop={handleDrop}
                                >
                                    <p>Drag and drop PDF files here</p>

                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() =>
                                            fileInput.current.click()
                                        }
                                    >
                                        Browse Files
                                    </button>
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,application/pdf"
                                    ref={fileInput}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                    onChange={event => {
                                        selectFiles(event.target.files)
                                        event.target.value = ''
                                    }}
                                />

                                <p>Selected Files:</p>

                                {selectedFiles.length === 0 ? (
                                    <p>No files selected</p>
                                ) : (
                                    <ul>
                                        {selectedFiles.map((file, index) => (
                                            <li key={index}>
                                                {file.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {uploadedCount > 0 && (
                                    <p>
                                        {uploadedCount} file(s) uploaded.
                                    </p>
                                )}

                                {uploadError && (
                                    <p
                                        role="alert"
                                        style={{ color: 'red' }}
                                    >
                                        {uploadError}
                                    </p>
                                )}

                                <div className="uploadActions">

                                    <button
                                        type="button"
                                        className="cancelUpload"
                                        onClick={closeUpload}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            selectedFiles.length === 0 ||
                                            uploading ||
                                            !isAuthenticated
                                        }
                                        onClick={handleUpload}
                                    >
                                        {uploading
                                            ? 'Uploading...'
                                            : 'Upload Files'}
                                    </button>

                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

        </div>
    )
}

export default FileRepository