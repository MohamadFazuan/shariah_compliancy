import React, { useState, useEffect, useRef } from "react";
import Router from 'next/router';
import Image from "next/image";
import FilePreview from "./Preview";
import styles from "../styles/DropZone.module.css";

const DropZone = ({ data, dispatch }) => {
    const [counter, setCounter] = useState(0);
    const dataFetchedRef = useRef(false);

    // onDragEnter sets inDropZone to true
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: true });
    };

    // onDragLeave sets inDropZone to false
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
    };

    // onDragOver sets inDropZone to true
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // set dropEffect to copy i.e copy of the source item
        e.dataTransfer.dropEffect = "copy";
        dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: true });
    };

    // onDrop sets inDropZone to false and adds files to fileList
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // get files from event on the dataTransfer object as an array
        let files = [...e.dataTransfer.files];

        // ensure a file or files are dropped
        if (files && files.length > 0) {
            // loop over existing files
            const existingFiles = data.fileList.map((f) => f.name);
            // check if file already exists, if so, don't add to fileList
            // this is to prevent duplicates
            files = files.filter((f) => !existingFiles.includes(f.name));

            // dispatch action to add droped file or files to fileList
            dispatch({ type: "ADD_FILE_TO_LIST", files });
            // reset inDropZone to false
            dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
        }
    };

    // handle file selection via input element
    const handleFileSelect = (e) => {
        // get files from event on the input element as an array
        let files = [...e.target.files];

        // ensure a file or files are selected
        if (files && files.length > 0) {
            // loop over existing files
            const existingFiles = data.fileList.map((f) => f.name);
            // check if file already exists, if so, don't add to fileList
            // this is to prevent duplicates
            files = files.filter((f) => !existingFiles.includes(f.name));

            // dispatch action to add selected file or files to fileList
            dispatch({ type: "ADD_FILE_TO_LIST", files });
        }
    };

    useEffect(() => {
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;
        counterList();
    }, []);

    // to get uploaded file
    const counterList = () => {
        fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/counter", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then((result) => {
            result.json().then((data) => {
                console.log('counterList', data.length);
                setCounter(data.length)
            });
        }).catch((e) => {
            return e.message
        });
    }

    // to handle file uploads
    const uploadFiles = async () => {
        // get the files from the fileList as an array
        let files = data.fileList;
        // initialize formData object
        const formData = new FormData();
        // loop over files and add to formData
        // counterList();

        if (files.length == 1) {

            console.log("SINGLE");

            var count = 1;

            for (var i = 0; i < files.length; i++) {
                var x = files[i];
                formData.append('id', counter + count);
                formData.append('name', x.name);
                formData.append('status', 'new');
                formData.append('contentType', x.type);
                formData.append('file', x);
                count++;
            }
            // Upload the files as a POST request to the server using fetch
            // Note: /api/fileupload is not a real endpoint, it is just an example
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/docs", {
                method: "POST",
                body: formData,
            });

            //successful file upload
            if (response.ok) {
                alert("Files uploaded successfully");
                Router.reload(window.location.pathname);
            } else {
                alert("Error uploading files");
            }
        } else {

            console.log("MULTIPLE");

            var count = 1;

            for (var i = 0; i < files.length; i++) {
                var x = files[i];
                formData.append('id', counter + count);
                formData.append('name', x.name);
                formData.append('status', 'new');
                formData.append('contentType', x.type);
                formData.append('file', x);
                count++;
            }
            // Upload the files as a POST request to the server using fetch
            // Note: /api/fileupload is not a real endpoint, it is just an example
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/multidocs", {
                method: "POST",
                body: formData,
            });

            //successful file upload
            if (response.ok) {
                alert("Files uploaded successfully");
                Router.reload(window.location.pathname);
            } else {
                alert("Error uploading files");
            }
        }
    };

    return (
        <div className={styles.fileContainer}  >
            <div
                className={styles.dropzone}
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragOver(e)}
                onDragEnter={(e) => handleDragEnter(e)}
                onDragLeave={(e) => handleDragLeave(e)}
            >
                <Image src="/upload.svg" alt="upload" height={50} width={50} />

                <input
                    id="fileSelect"
                    type="file"
                    multiple
                    className={styles.files}
                    onChange={(e) => handleFileSelect(e)}
                    accept="application/pdf, 
                    text/plain, application/msword, 
                    application/vnd.openxmlformats-officedocument.wordprocessingml.document, 
                    application/vnd.ms-excel, 
                    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                />
                <label htmlFor="fileSelect">You can select files</label>

                <h3 className={styles.uploadMessage}>
                    or drag &amp; drop your files here
                </h3>
            </div>
            {/* Pass the selectect or dropped files as props */}
            {/* <FilePreview fileData={data} /> */}
            <h3>{data.fileList.length} files found</h3>

            {/* Only show upload button after selecting atleast 1 file */}
            {data.fileList.length > 0 && (

                <button aria-label="uploadButton" className={styles.uploadBtn} onClick={uploadFiles}>
                    Upload
                </button>

            )}
        </div>
    );
};

export default DropZone;
