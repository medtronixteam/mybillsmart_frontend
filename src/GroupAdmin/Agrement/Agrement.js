import React, { useState } from 'react';
import "./Agrement.css";
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Agrement = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleTitleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in both title and description fields',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${config.BASE_URL}/api/group/agreements`,
        {
          title: formData.title,
          description: formData.description,
          status: 'private'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Agreement created successfully!',
          confirmButtonColor: '#3085d6',
          timer: 2000
        });
        // Reset form
        setFormData({
          title: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating agreement:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create agreement',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }]
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
    'color', 'background',
    'align'
  ];

  return (
    <div className="agreement-container">
      <h2>Create New Agreement</h2>
      <form onSubmit={handleSubmit} className="agreement-form">
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter agreement title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            placeholder="Enter detailed agreement description..."
            className="quill-editor"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : 'Create Agreement'}
        </button>
      </form>
    </div>
  );
};

export default Agrement;