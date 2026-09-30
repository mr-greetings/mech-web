import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Download,
  ArrowUpRight,
  PlusCircle,
  Tag,
  CheckCircle,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const EventsPage = ({ onSelectEvent, onNavigate }) => {
  const { isStaff, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'upcoming' | 'completed'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'upcoming' && ev.status === 'upcoming') ||
        (statusFilter === 'completed' && ev.status === 'completed');

      const matchesCategory =
        categoryFilter === 'ALL' || ev.category === categoryFilter;

      const matchesSearch =
        !searchQuery ||
        ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [events, statusFilter, categoryFilter, searchQuery]);

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT CALENDAR & SYMPOSIA" code="ME-EVT-02" variant="amber" />
          <h1 className="page-title">Events & Symposia</h1>
          <p className="page-subtitle">
            Explore technical hackathons, hands-on industrial bootcamps, masterclasses, and automotive racing challenges hosted by CIET Mechanical Engineering.
          </p>
        </div>

        {(isStaff || isAdmin) && (
          <div className="staff-action-shortcut">
            <button
              className="btn btn-primary"
              onClick={() => onNavigate(isStaff ? 'staff-dashboard' : 'admin-dashboard')}
            >
              <PlusCircle size={16} />
              <span>Create Event (Dashboard)</span>
            </button>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <section className="events-controls-section page-width">
        <div className="controls-row">
          {/* Status Tabs */}
          <div className="status-toggle-group">
            {[
              { id: 'ALL', label: 'All Events' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`status-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-field-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search event title, venue, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="category-select-wrap">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="page-width events-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading events schedule...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state-box">
            <h3>No events match your criteria</h3>
            <p>Try clearing filters or changing the search terms.</p>
          </div>
        ) : (
          <div className="events-cards-grid">
            {filteredEvents.map((event) => (
              <article key={event.id} className="event-card-modern">
                <div className="event-card-poster">
                  <img
                    src={event.poster || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85'}
                    alt={event.title}
                    loading="lazy"
                  />
                  <div className="poster-status-badge">
                    {event.status === 'upcoming' ? (
                      <span className="status-pill upcoming">
                        <Flame size={12} /> Upcoming
                      </span>
                    ) : (
                      <span className="status-pill completed">
                        <CheckCircle size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <div className="poster-category-tag">{event.category || 'Event'}</div>
                </div>

                <div className="event-card-info">
                  <div className="event-meta-line">
                    <span className="meta-item">
                      <Calendar size={14} />
                      <span>{event.date}</span>
                    </span>
                    {event.time && (
                      <span className="meta-item">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="event-title">{event.title}</h3>

                  {event.venue && (
                    <div className="event-venue-text">
                      <MapPin size={14} />
                      <span>{event.venue}</span>
                    </div>
                  )}

                  <p className="event-excerpt">{event.description}</p>

                  <div className="event-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectEvent(event)}
                    >
                      <span>View Details</span>
                      <ArrowUpRight size={14} />
                    </button>

                    {event.brochure && (
                      <a
                        href={event.brochure}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Download Event Brochure"
                      >
                        <Download size={14} />
                        <span>Brochure</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
