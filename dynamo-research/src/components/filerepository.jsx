import { useState, useRef } from 'react'
import { uploadFiles } from '../services/api'
import '../styles/filerepository.css'

function FileRepository() {
    const [showUpload, setShowUpload] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const fileInput = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState([])
        const [uploadSuccess, setUploadSuccess] = useState(false)

    async function handleUpload() {
        setUploading(true)
        setUploadError(null)

        try {
            for (const file of selectedFiles) {
                const result = await uploadFiles(file)
                setUploadedFiles((prev) => [
                    ...prev,
                    result
                ])

                setSelectedFiles((prev) => 
                    prev.filter(item => item !== file)
                )
            }

            setuploadSuccess(true)

        } catch (error) {
            setUploadError(error.message)
        } finally {
            setUploading(false)
        }
    }
    function closeUpload() {
        setShowUpload(false)
        setSelectedFiles([])
        setUploadSuccess(false)

        if (fileInput.current) {
            fileInput.current.value = ''
        }
    }

    return (
        <div className="fileRepository">
            <h1>File Repository</h1>
            <p>Manage your published paper and supporting research files.</p>

            <hr />

            <h2>Published Paper</h2>

            <div className="publishedPaper">
                <div>
                    <h3>Research_Paper.pdf</h3>
                    <p>Published research paper - PDF</p>
                </div>

                <button type="button">
                    View Paper
                </button>
            </div>

            <h2>Supporting Research Files</h2>

            <button
                type="button"
                className="addFilesButton"
                onClick={() => setShowUpload(true)}
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
                            No files uploaded yet.
                        </td>
                    </tr>
                ) : (
                    uploadedFiles.map(file => (
                        <tr key={file.file_id}>
                            <td>{file.filename}</td>

                            <td>
                                {file.filename.split('.').pop().toUpperCase()}
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

            {showUpload && (
                <div className="uploadOverlay">
                    <div className="uploadPopup">

                        {uploadSuccess ? (
                            <div className="successMessage">
                                <h2>Upload Successful!</h2>
                                <p>
                                    Your file(s) have been added successfully.
                                </p>

                            <div className="successBox">
                                <h1>✓</h1>

                                <p>
                                    {selectedFiles.length} file(s) selected for upload.
                                </p>
                            </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        closeUpload()
                                    }}
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
                                >
                                    ×
                                </button>

                                <h2>Add Research Files</h2>
                                <div className="uploadArea">
                                    <p>Drag and drop files here</p>

                                    <button
                                        type="button"
                                        onClick={() => fileInput.current.click()}
                                    >
                                        Browse Files
                                    </button>
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    ref={fileInput}
                                    style={{ display: 'none' }}
                                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                />

                                <p>Selected Files:</p>

                                {selectedFiles.length === 0 ? (
                                    <p>No files selected</p>
                                ) : (
                                    <ul>
                                        {selectedFiles.map((file, index) => (
                                            <li key={index}>{file.name}</li>
                                        ))}
                                    </ul>
                                )}

                            <div className="uploadActions">
                                <button
                                    type="button"
                                    className="cancelUpload"
                                    onClick={closeUpload}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={selectedFiles.length === 0 || uploading}
                                    onClick={handleUpload}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Files'}
                                </button>

                                {uploadError && (
                                    <p role="alert" style={{ color: 'red' }}>
                                        {uploadError}
                                    </p>
                                )}
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
