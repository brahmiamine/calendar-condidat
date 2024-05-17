import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Set locale to French
moment.locale("fr");

const localizer = momentLocalizer(moment);

const initialCandidates = [
  { id: 1, firstName: "John", lastName: "Doe", age: 30, position: "Développeur", email: "john.doe@example.com", emailSent: false },
  { id: 2, firstName: "Jane", lastName: "Smith", age: 25, position: "Designer", email: "jane.smith@example.com", emailSent: false },
  { id: 3, firstName: "Bob", lastName: "Johnson", age: 35, position: "Manager", email: "bob.johnson@example.com", emailSent: false },
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
    <div ref={drag} className="list-group-item list-group-item-action" style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}>
      <strong>
        {candidate.firstName} {candidate.lastName}
      </strong>
      <br />
      <small>{candidate.position}</small>
      <br />
      <small>{candidate.email}</small>
    </div>
  );
};

const CalendarComponent = () => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventStart, setEventStart] = useState(null);

  useEffect(() => {
    if (modalIsOpen) {
      document.getElementById("exampleModal").classList.add("show");
      document.getElementById("exampleModal").style.display = "block";
      document.body.classList.add("modal-open");
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
    } else {
      document.getElementById("exampleModal").classList.remove("show");
      document.getElementById("exampleModal").style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }
  }, [modalIsOpen]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "candidate",
    drop: (item, monitor) => {
      handleCandidateDrop(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleCandidateDrop = (candidate) => {
    const newEvent = {
      title: `${candidate.firstName} ${candidate.lastName}`,
      start: new Date(),
      end: moment(new Date()).add(1, "hour").toDate(),
      candidateId: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      position: candidate.position,
      email: candidate.email,
      emailSent: candidate.emailSent,
    };
    setSelectedEvent(newEvent);
    setEventStart(new Date());
    setModalIsOpen(true);
  };

  const handleSaveEvent = () => {
    const newEvent = { ...selectedEvent, start: eventStart, end: moment(eventStart).add(1, "hour").toDate() };
    const existingEventIndex = events.findIndex((event) => event.candidateId === selectedEvent.candidateId);

    if (existingEventIndex > -1) {
      const updatedEvents = [...events];
      updatedEvents[existingEventIndex] = newEvent;
      setEvents(updatedEvents);
    } else {
      setEvents([...events, newEvent]);
      setCandidates(candidates.filter((c) => c.id !== selectedEvent.candidateId));
    }

    setModalIsOpen(false);
  };

  const moveEvent = ({ event, start, end }) => {
    const updatedEvent = { ...event, start, end };
    setEvents(events.map((evt) => (evt.candidateId === event.candidateId ? updatedEvent : evt)));
  };

  const resizeEvent = ({ event, start, end }) => {
    const updatedEvent = { ...event, start, end };
    setEvents(events.map((evt) => (evt.candidateId === event.candidateId ? updatedEvent : evt)));
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setEventStart(event.start);
    setModalIsOpen(true);
  };

  const handleDeleteEvent = (event, e) => {
    e.stopPropagation();
    setEvents(events.filter((evt) => evt.candidateId !== event.candidateId));
    setCandidates([...candidates, { ...event, emailSent: event.emailSent }]);
  };

  const handleSendEmail = (event, e) => {
    e.stopPropagation();
    alert(`Email envoyé à ${event.email}`);
    setEvents(events.map((evt) => (evt.candidateId === event.candidateId ? { ...evt, emailSent: true } : evt)));
  };

  const handleAutoAssign = () => {
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();
    const newEvents = candidates.map((candidate) => {
      const randomDate = new Date(startOfMonth.getTime() + Math.random() * (endOfMonth.getTime() - startOfMonth.getTime()));
      return {
        title: `${candidate.firstName} ${candidate.lastName}`,
        start: randomDate,
        end: moment(randomDate).add(1, "hour").toDate(),
        candidateId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        position: candidate.position,
        email: candidate.email,
        emailSent: candidate.emailSent,
      };
    });

    setEvents(newEvents);
  };

  const EventWithActions = ({ event }) => {
    return (
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", whiteSpace: "nowrap", padding: "5px", borderRadius: "5px" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
          {event.title}, {event.position}
        </span>
        {!event.emailSent && (
          <button onClick={(e) => handleSendEmail(event, e)} className="btn btn-link p-0" style={{ color: "yellow", marginRight: "10px" }}>
            <i className="fas fa-envelope"></i>
          </button>
        )}
        <button onClick={(e) => handleDeleteEvent(event, e)} className="btn btn-link p-0" style={{ color: "red" }}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="d-flex h-100">
      <div className="col-3 p-3 border-right">
        <h4 className="mb-3">Candidats</h4>
        <div className="list-group mb-3">
          {candidates.map((candidate) => (
            <DraggableCandidate key={candidate.id} candidate={candidate} />
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleAutoAssign}>
          Affecter Automatiquement
        </button>
      </div>
      <div ref={drop} className="col-9 p-3">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "80vh" }}
          selectable
          draggableAccessor={() => true}
          onEventDrop={moveEvent}
          resizable
          onEventResize={resizeEvent}
          onSelectEvent={handleEventSelect}
          components={{
            event: EventWithActions,
          }}
        />
      </div>

      {/* Bootstrap Modal */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {selectedEvent ? "Modifier l'entretien" : "Planifier un entretien"}
              </h5>
            </div>
            <div className="modal-body">
              <p>{selectedEvent && `${selectedEvent.firstName} ${selectedEvent.lastName}, ${selectedEvent.position}`}</p>
              <label>
                Heure de début:
                <input
                  type="datetime-local"
                  className="form-control"
                  value={moment(eventStart).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => setEventStart(new Date(e.target.value))}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEvent}>
                {selectedEvent ? "Enregistrer les modifications" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <DndProvider backend={HTML5Backend}>
    <CalendarComponent />
  </DndProvider>
);

export default App;
