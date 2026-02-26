import React, {useState, useEffect, use} from 'react'
import toast from 'react-hot-toast'

import documentServices from '../../services/documentService.js'
import Spinner from '../../components/common/Spinner.jsx'

const DocumentListPage = () => {
    const [document, setDocument]= useState();
    const [loading, setLoading]= useState(false);

    //State for upload modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile]= useState(null);
    const [uploadTitle, setUploadTitle]= useState("");
    const [uploading, setUploading]= useState(false);

    //State for delete confirmation model
    const [isDeletedModelOpen, setIsDeletedModelOpen]= useState(false);
    const [deleting, setDeleting]= useState(false);
    const [selectedDoc, setSelectedDoc]= useState(null);

    const fetchDocuments= async() => {
        try {
            setLoading(true);
            const data= await documentServices.getDocuments();
            console.log("Document__data", data);
            setDocument(data);
        } catch (error) {
            toast.error("Failed to fetch documents");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange= (e) => {
        const file= e.target.files[0];
        if(file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleUpload= async (e) => {
        e.preventDefault();
        if(!uploadFile || !uploadTitle) {
            toast.error("Please provide a title and select a file.");
            returns;
        }

        setUploading(true);
        const formData= new FormData();
        formData.append('file', uploadFile);
        formData.append('title', uploadTitle);

        try {
            await documentServices.uploadDocument(formData);
            toast.success("Document uploaded successfully!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle("");
            setLoading(true);
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRequest= (doc) => {
        setSelectedDoc(doc);
        setIsDeletedModelOpen(true);
    };

    const handleConfirmDelete= async() => {
        if(!selectedDoc) return;
        setDeleting(true);

        try {
            await documentServices.deleteDocument(selectedDoc._id);
            toast.success(`${selectedDoc.title} deleted`);
            setIsDeletedModelOpen(false);
            setSelectedDoc(null);
            setDocument(document.filter((d) => d._id !== selectedDoc._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete document.");
        } finally {
            setDeleting(false);
        }
    };

    const renderContent= () => {
        return <div>Render Content</div>
    };

    

    return (
        <div>DocumentListPage</div>
    )
}

export default DocumentListPage