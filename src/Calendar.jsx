import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const candidates = [
  { id: 1, name: "Candidate 1" },
  { id: 2, name: "Candidate 2" },
  { id: 3, name: "Candidate 3" },
];

const DraggableCandidate = ({ candidate }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "candidate",
    item: candidate,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, padding: "8px", border: "1px solid gray", marginBottom: "4px" }}>
      {candidate.name}
    </div>
  );
};

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [eventStart, setEventStart] = useState(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "candidate",
    drop: (item, monitor) => {
      const delta = monitor.getClientOffset();
      handleCandidateDrop(item, delta);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleCandidateDrop = (candidate, delta) => {
    setSelectedCandidate(candidate);
    setEventStart(new Date());
    setModalIsOpen(true);
  };

  const handleSaveEvent = () => {
    setEvents([...events, { title: selectedCandidate.name, start: eventStart, end: moment(eventStart).add(1, "hour").toDate() }]);
    setModalIsOpen(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "25%", padding: "10px", borderRight: "1px solid #ccc" }}>
        {candidates.map((candidate) => (
          <DraggableCandidate key={candidate.id} candidate={candidate} />
        ))}
      </div>
      <div ref={drop} style={{ width: "75%", padding: "10px" }}>
        <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 500 }} />
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Schedule Interview</h2>
        <p>{selectedCandidate && selectedCandidate.name}</p>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={moment(eventStart).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) => setEventStart(new Date(e.target.value))}
          />
        </label>
        <button onClick={handleSaveEvent}>Save</button>
      </Modal>
    </div>
  );
};

const App = () => (
  <DndProvider backend={HTML5Backend}>
    <CalendarComponent />
  </DndProvider>
);

export default App;
