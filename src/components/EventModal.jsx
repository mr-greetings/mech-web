import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  ExternalLink,
  Tag,
  Share2,
} from 'lucide-react';

export const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window event-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-banner-wrap">
          <img
            src={event.poster || event.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85'}
            alt={event.title}
            className="modal-banner-img"
          />
          <div className="modal-banner-gradient" />
          <div className="modal-banner-tag">
            <Tag size={13} />
            <span>{event.category || 'Event'}</span>
          </div>
        </div>

        <div className="modal-content-body">
          <div className="modal-meta-bar">
            <div className="meta-pill">
              <Calendar size={14} />
              <span>{event.date}</span>
            </div>
            {event.time && (
              <div className="meta-pill">
                <Clock size={14} />
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="meta-pill">
                <MapPin size={14} />
                <span>{event.venue}</span>
              </div>
            )}
          </div>

          <h2 className="modal-title">{event.title}</h2>

          <div className="modal-organizers">
            <Users size={15} />
            <span>Organized by: <strong>{event.organizers || event.uploadedBy || 'CIET Mechanical Department'}</strong></span>
          </div>

          <div className="modal-description-text">
            {event.description}
          </div>

          {/* Event Gallery Images if any */}
          {event.images && event.images.length > 0 && (
            <div className="modal-event-gallery">
              <h4 className="subheading">Event Highlights & Visuals</h4>
              <div className="event-img-row">
                {event.images.map((img, i) => (
                  <img key={i} src={img} alt={`Event capture ${i + 1}`} className="event-highlight-thumb" />
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Register, Download Brochure, Share */}
          <div className="modal-actions-bar">
            {event.registrationLink ? (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <span>Register for Event</span>
                <ExternalLink size={15} />
              </a>
            ) : (
              <button className="btn btn-primary" disabled>
                Registration Open On-Spot
              </button>
            )}

            {event.brochure && (
              <a
                href={event.brochure}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Download size={15} />
                <span>Download Brochure</span>
              </a>
            )}

            <button className="btn btn-outline" onClick={handleShare}>
              <Share2 size={15} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
