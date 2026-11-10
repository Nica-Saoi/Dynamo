
import { useState, useRef } from 'react'

function FileRepository() {
    const [showUpload, setShowUpload] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const fileInput = useRef(null)
        const [uploadSuccess, setUploadSuccess] = useState(false)

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
                    <tr>
                        <td>Simulation_Data.csv</td>
                        <td>Dataset</td>
                        <td>2.4 MB</td>
                        <td>
                            <button type="button">View</button>
                        </td>
                    </tr>

                    <tr>
                        <td>Research_Code.py</td>
                        <td>Source Code</td>
                        <td>15 KB</td>
                        <td>
                            <button type="button">View</button>
                        </td>
                    </tr>

                    <tr>
                        <td>Experiment_Results.png</td>
                        <td>Image</td>
                        <td>1.8 MB</td>
                        <td>
                            <button type="button">View</button>
                        </td>
                    </tr>
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

                                <h1>✓</h1>

                                <p>
                                    {selectedFiles.length} file(s) selected for upload.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpload(false)
                                        setUploadSuccess(false)
                                        setSelectedFiles([])
                                    }}
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                >
                                    ×
                                </button>

                                <h2>Add Research Files</h2>
                                <p>Drag and drop files here</p>

                                <input
                                    type="file"
                                    multiple
                                    ref={fileInput}
                                    style={{ display: 'none' }}
                                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInput.current.click()}
                                >
                                    Browse Files
                                </button>

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

                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={selectedFiles.length === 0}
                                    onClick={() => setUploadSuccess(true)}
                                >
                                    Upload Files
                                </button>
                            </>
                        )}

                    </div>
                </div>
            )}
        </div>
    )
}

export default FileRepository
