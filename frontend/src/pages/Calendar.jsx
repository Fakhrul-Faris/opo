import React, { useState, useEffect } from "react";
import axios from "axios";

const Calendar = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [campRes, contRes] = await Promise.all([
          axios.get("/campaigns", { headers }),
          axios.get("/content", { headers }),
        ]);

        setCampaigns(campRes.data || []);
        setContent(contRes.data || []);
      } catch (err) {
        console.error("Failed to fetch calendar data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEventsForDate = (date) => {
    const events = [];
    
    campaigns.forEach((camp) => {
      if (camp.start_date === date) {
        events.push({ type: "campaign", data: camp, label: `📢 ${camp.name}` });
      }
      if (camp.end_date === date) {
        events.push({ type: "campaign-end", data: camp, label: `🏁 ${camp.name} ends` });
      }
    });

    content.forEach((asset) => {
      if (asset.published_date === date) {
        events.push({ type: "content", data: asset, label: `📝 ${asset.title}` });
      }
    });

    return events;
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const currentDate = new Date(selectedDate);
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const days = daysInMonth(monthStart);
  const startingDayOfWeek = firstDayOfMonth(monthStart);

  const calendarDays = Array(startingDayOfWeek).fill(null).concat(
    Array.from({ length: days }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
      return date.toISOString().split('T')[0];
    })
  );

  return (
    <div className="glass-card max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Campaign & Content Calendar</h2>
        <p className="text-muted mt-2">Plan campaigns and content publication across all channels.</p>
      </div>

      {loading ? (
        <p className="text-muted text-center py-8">Loading calendar...</p>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <button 
              className="btn-primary"
              onClick={() => setSelectedDate(new Date(new Date(selectedDate).setMonth(new Date(selectedDate).getMonth() - 1)).toISOString().split('T')[0])}
            >
              ← Previous
            </button>
            <h3 className="text-lg font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              className="btn-primary"
              onClick={() => setSelectedDate(new Date(new Date(selectedDate).setMonth(new Date(selectedDate).getMonth() + 1)).toISOString().split('T')[0])}
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-muted text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, idx) => {
              const events = date ? getEventsForDate(date) : [];
              return (
                <div
                  key={idx}
                  className="glass-card p-3 min-h-24 relative"
                  style={{
                    background: date === new Date().toISOString().split('T')[0] ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {date && (
                    <>
                      <p className="font-semibold text-white text-sm">
                        {new Date(date).getDate()}
                      </p>
                      <div className="mt-1 space-y-1">
                        {events.map((event, i) => (
                          <p key={i} className="text-xs text-primary truncate" title={event.label}>
                            {event.label}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
