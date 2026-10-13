import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import {
  BusFront, Search, MapPin, Clock3, Users, RefreshCw, Send,
  Activity, Route, ShieldCheck, ChevronRight, Wifi, AlertCircle
} from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const socket = io(API, { autoConnect: true, transports: ['websocket', 'polling'] });

function timeAgo(date) {
  if (!date) return 'No recent reports';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hr${hours > 1 ? 's' : ''} ago`;
}

function crowdClass(level) {
  return level ? level.toLowerCase() : 'unknown';
}

export default function App() {
  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [reports, setReports] = useState([]);
  const [stopName, setStopName] = useState('');
  const [crowdLevel, setCrowdLevel] = useState('Medium');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedBus = useMemo(() => buses.find(b => b._id === selected) || buses[0] || null, [buses, selected]);

  async function loadBuses(query = search) {
    try {
      const response = await fetch(`${API}/api/buses?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Could not load buses. Is the backend running?');
      const data = await response.json();
      setBuses(data);
      if (selected && !data.some(bus => bus._id === selected)) setSelected('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadReports(busId) {
    if (!busId) { setReports([]); return; }
    try {
      const response = await fetch(`${API}/api/buses/${busId}/reports`);
      if (!response.ok) throw new Error('Could not load reports.');
      setReports(await response.json());
    } catch (err) { setError(err.message); }
  }

  useEffect(() => { loadBuses(''); }, []);
  useEffect(() => { if (selectedBus) { setStopName(selectedBus.stops?.[0] || selectedBus.startPoint); loadReports(selectedBus._id); } }, [selectedBus?._id]);
  useEffect(() => {
    const refresh = () => { loadBuses(); if (selectedBus) loadReports(selectedBus._id); };
    socket.on('crowd:updated', refresh);
    return () => socket.off('crowd:updated', refresh);
  }, [search, selectedBus?._id]);

  async function submitReport(event) {
    event.preventDefault();
    if (!selectedBus) return;
    setSubmitting(true); setMessage(''); setError('');
    try {
      const response = await fetch(`${API}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId: selectedBus._id, stopName, crowdLevel, note })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to submit report.');
      setMessage('Thanks! Your crowd report has been shared.');
      setNote('');
      await Promise.all([loadBuses(), loadReports(selectedBus._id)]);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const totalReports = buses.reduce((sum, bus) => sum + (bus.crowd?.reportCount || 0), 0);
  const crowdedBuses = buses.filter(bus => bus.crowd?.latestLevel === 'High').length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SmartBus home">
          <span className="brand-icon"><BusFront size={23} /></span>
          <span>smart<span className="brand-accent">bus</span><small>COMMUNITY TRANSIT</small></span>
        </a>
        <div className="topbar-right"><span className="live-dot" /> Community reports <span className="topbar-divider">/</span> Demo mode</div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> YOUR RIDE, WITH MORE CLARITY</div>
            <h1>Know the crowd.<br /><span>Plan your ride.</span></h1>
            <p>Check recent passenger crowd reports before you head to your bus stop. Share what you see and help your community travel smarter.</p>
            <a href="#bus-list" className="hero-link">Explore bus routes <ChevronRight size={16} /></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="art-card"><BusFront size={76} strokeWidth={1.25} /></div>
            <span className="floating-chip chip-top"><Activity size={15} /> Live community updates</span>
            <span className="floating-chip chip-bottom"><MapPin size={15} /> Route awareness</span>
            <span className="art-star star-one">✳</span><span className="art-star star-two">✳</span>
          </div>
        </section>

        <section className="stats-grid" aria-label="Bus report summary">
          <div className="stat-card"><span className="stat-icon purple"><Route size={19} /></span><div><span className="stat-label">AVAILABLE ROUTES</span><strong>{buses.length.toString().padStart(2, '0')}</strong><small>Demo routes</small></div></div>
          <div className="stat-card"><span className="stat-icon blue"><Users size={19} /></span><div><span className="stat-label">RECENT REPORTS</span><strong>{totalReports}</strong><small>Last 2 hours</small></div></div>
          <div className="stat-card"><span className="stat-icon orange"><Activity size={19} /></span><div><span className="stat-label">HIGH CROWDING</span><strong>{crowdedBuses.toString().padStart(2, '0')}</strong><small>Routes with high reports</small></div></div>
          <div className="stat-card"><span className="stat-icon green"><ShieldCheck size={19} /></span><div><span className="stat-label">COMMUNITY POWER</span><strong>Live</strong><small>Passenger submitted</small></div></div>
        </section>

        <section className="content-grid" id="bus-list">
          <div className="routes-panel">
            <div className="section-heading">
              <div><div className="section-kicker">FIND YOUR ROUTE</div><h2>Bus routes</h2></div>
              <button className="icon-button" onClick={() => { setLoading(true); loadBuses(); }} title="Refresh routes"><RefreshCw size={17} /></button>
            </div>
            <label className="search-box"><Search size={18} /><input value={search} onChange={e => { setSearch(e.target.value); loadBuses(e.target.value); }} placeholder="Search bus, stop or destination..." /></label>
            {loading ? <div className="empty-state">Loading routes…</div> : buses.length === 0 ? <div className="empty-state"><BusFront size={28} /><p>No routes found. Try another search.</p></div> : (
              <div className="bus-list">
                {buses.map(bus => (
                  <button className={`bus-row ${selectedBus?._id === bus._id ? 'selected' : ''}`} key={bus._id} onClick={() => setSelected(bus._id)}>
                    <span className="bus-number"><BusFront size={20} /><b>{bus.busNumber}</b></span>
                    <span className="bus-info"><strong>{bus.routeName}</strong><small>{bus.startPoint} <span>→</span> {bus.endPoint}</small><small className="stop-count"><MapPin size={12} /> {bus.stops?.length || 0} stops</small></span>
                    <span className={`crowd-pill ${crowdClass(bus.crowd?.latestLevel)}`}>{bus.crowd?.latestLevel || 'No data'}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="list-note"><AlertCircle size={15} /> Demo routes only — replace with verified local transit data.</div>
          </div>

          <div className="detail-column">
            <section className="detail-card">
              <div className="section-heading">
                <div><div className="section-kicker">ROUTE SNAPSHOT</div><h2>{selectedBus ? selectedBus.busNumber : 'Select a bus'}</h2></div>
                <span className="live-label"><span className="live-dot" /> REPORT FEED</span>
              </div>
              {selectedBus ? <>
                <h3 className="route-title">{selectedBus.routeName}</h3>
                <div className="route-endpoints"><div><span className="endpoint-dot start" /><span><small>STARTING POINT</small><strong>{selectedBus.startPoint}</strong></span></div><div className="endpoint-line" /><div><span className="endpoint-dot end" /><span><small>DESTINATION</small><strong>{selectedBus.endPoint}</strong></span></div></div>
                <div className="crowd-summary">
                  <div><span className="section-kicker">LATEST CROWD REPORT</span><strong className={`crowd-big ${crowdClass(selectedBus.crowd?.latestLevel)}`}>{selectedBus.crowd?.latestLevel || 'Not reported'}</strong><small><Clock3 size={13} /> {timeAgo(selectedBus.crowd?.latestAt)}</small></div>
                  <div className="summary-divider" /><div><span className="section-kicker">REPORTS IN 2 HOURS</span><strong className="summary-count">{selectedBus.crowd?.reportCount || 0}</strong><small>Community submissions</small></div>
                </div>
                <div className="stops-block"><span className="section-kicker">ROUTE STOPS</span><div className="stop-chips">{selectedBus.stops?.map((stop, index) => <span className="stop-chip" key={stop}><i>{index + 1}</i>{stop}</span>)}</div></div>
              </> : <div className="empty-state">Select a route to see its details.</div>}
            </section>

            <section className="report-card">
              <div className="section-heading report-heading"><div><div className="section-kicker">HELP OTHER PASSENGERS</div><h2>Report crowd level</h2></div><span className="report-icon"><Send size={18} /></span></div>
              <form onSubmit={submitReport}>
                <label className="field-label">Your current bus stop</label>
                <select value={stopName} onChange={e => setStopName(e.target.value)} disabled={!selectedBus} required>
                  {selectedBus?.stops?.map(stop => <option key={stop} value={stop}>{stop}</option>)}
                </select>
                <label className="field-label">How crowded is the bus?</label>
                <div className="crowd-options">
                  {['Low', 'Medium', 'High'].map(level => <button type="button" key={level} className={`crowd-option ${level.toLowerCase()} ${crowdLevel === level ? 'active' : ''}`} onClick={() => setCrowdLevel(level)}><span className="level-dot" /><strong>{level}</strong><small>{level === 'Low' ? 'Plenty of space' : level === 'Medium' ? 'Some seats / standing' : 'Very crowded'}</small></button>)}
                </div>
                <label className="field-label">Optional note <span>(max 180 characters)</span></label>
                <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={180} placeholder="e.g. Standing room only near the front…" rows={2} />
                {message && <div className="form-message success">{message}</div>}
                {error && <div className="form-message error">{error}</div>}
                <button className="submit-button" type="submit" disabled={!selectedBus || submitting}>{submitting ? 'Submitting…' : 'Share crowd report'} <Send size={16} /></button>
                <p className="privacy-note"><ShieldCheck size={13} /> Be respectful. Reports are community estimates, not official passenger counts.</p>
              </form>
            </section>
          </div>
        </section>

        <section className="recent-section">
          <div className="section-heading"><div><div className="section-kicker">COMMUNITY ACTIVITY</div><h2>Recent reports</h2></div><span className="recent-count">{reports.length} shown</span></div>
          {reports.length === 0 ? <div className="recent-empty"><Wifi size={19} /><span>No reports for this bus yet. Be the first to share an update.</span></div> : (
            <div className="reports-table">
              <div className="report-table-head"><span>STOP</span><span>CROWD LEVEL</span><span>NOTE</span><span>REPORTED</span></div>
              {reports.slice(0, 8).map(report => <div className="report-table-row" key={report._id}><span className="report-stop"><MapPin size={14} />{report.stopName}</span><span><span className={`crowd-pill ${crowdClass(report.crowdLevel)}`}>{report.crowdLevel}</span></span><span className="report-note">{report.note || '—'}</span><span className="report-time"><Clock3 size={13} />{timeAgo(report.reportedAt)}</span></div>)}
            </div>
          )}
        </section>

        <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-icon"><BusFront size={18} /></span><span>smart<span className="brand-accent">bus</span></span></a><span>Built for smarter, community-powered journeys.</span><span className="footer-status"><span className="live-dot" /> API connection depends on local server</span></footer>
      </main>
    </div>
  );
}
