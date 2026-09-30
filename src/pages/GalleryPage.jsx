import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Filter,
  Maximize2,
  X,
  Upload,
  PlusCircle,
  Tag,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const GalleryPage = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [lightboxItem, setLightboxItem] = useState(null);

  // Quick upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Events');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    'ALL',
    'Events',
    'Workshops',
    'Seminars',
    'Industrial Visits',
    'Competitions',
    'SAE Club',
    'Student Activities',
    'Faculty Activities',
  ];

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const data = await api.getGallery();
      setGalleryItems(data || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') return galleryItems;
    return galleryItems.filter(
      (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [galleryItems, activeCategory]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Please choose an image file to upload.', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await api.uploadFile(uploadFile);
      const imageUrl = uploadRes.file.url;

      await api.createGalleryItem({
        title: uploadTitle,
        category: uploadCategory,
        caption: uploadCaption,
        image: imageUrl,
      });

      addToast('Image uploaded to department gallery!', 'success');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadCaption('');
      setUploadFile(null);
      fetchGallery();
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT VISUAL ARCHIVE" code="ME-GAL-05" variant="blue" />
          <h1 className="page-title">Department Gallery</h1>
          <p className="page-subtitle">
            A visual chronicle of hands-on machining, laboratory experiments, racing car fabrication, industry visits, and academic milestones.
          </p>
        </div>

        {isAuthenticated && (
          <div className="staff-action-shortcut">
            <button
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={16} />
              <span>Upload Photo</span>
            </button>
          </div>
        )}
      </section>

      {/* Category Pills */}
      <section className="gallery-filter-bar page-width">
        <div className="gallery-tabs-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Masonry / Grid */}
      <section className="page-width gallery-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading visual gallery...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state-box">
            <ImageIcon size={36} />
            <p>No photos uploaded for this category yet.</p>
          </div>
        ) : (
          <div className="gallery-masonry-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="gallery-grid-card"
                onClick={() => setLightboxItem(item)}
              >
                <div className="gallery-img-container">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="gallery-overlay">
                    <span className="gallery-category-pill">{item.category}</span>
                    <h4 className="gallery-card-title">{item.title}</h4>
                    {item.caption && <p className="gallery-card-caption">{item.caption}</p>}
                    <span className="expand-indicator">
                      <Maximize2 size={16} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="lightbox-backdrop" onClick={() => setLightboxItem(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxItem(null)}
              aria-label="Close image"
            >
              <X size={24} />
            </button>
            <img src={lightboxItem.image} alt={lightboxItem.title} className="lightbox-img" />
            <div className="lightbox-caption-bar">
              <span className="category-tag">{lightboxItem.category}</span>
              <h3>{lightboxItem.title}</h3>
              {lightboxItem.caption && <p>{lightboxItem.caption}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-window upload-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
              <X size={20} />
            </button>
            <h3>Upload Department Photo</h3>
            <form onSubmit={handleUploadSubmit} className="auth-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Axis CNC Demonstration"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                >
                  {categories.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Caption / Context</label>
                <textarea
                  rows={3}
                  placeholder="Describe the activity, batch, or workshop details..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Select Image File (JPG, PNG, WEBP)</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={uploading}>
                <span>{uploading ? 'Uploading...' : 'Publish to Gallery'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
