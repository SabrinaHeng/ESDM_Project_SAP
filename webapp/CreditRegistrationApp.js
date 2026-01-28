// Simple React credit hour validator using existing data.json as "backend"
// This file is loaded from react-index.html via CDN React/ReactDOM.

const MIN_CREDITS = 9;
const MAX_CREDITS = 21;

function useCourses() {
  const [state, setState] = React.useState({
    loading: true,
    error: null,
    student: null,
    courses: [],
  });

  React.useEffect(() => {
    fetch("model/data.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load course data");
        }
        return res.json();
      })
      .then((data) => {
        setState({
          loading: false,
          error: null,
          student: data.student,
          courses: data.availableCourses || [],
        });
      })
      .catch((err) => {
        setState({
          loading: false,
          error: err.message || "Unknown error",
          student: null,
          courses: [],
        });
      });
  }, []);

  return state;
}

function CreditRegistrationApp() {
  const { loading, error, student, courses } = useCourses();
  const [selectedCodes, setSelectedCodes] = React.useState(new Set());

  const totalCredits = React.useMemo(() => {
    return courses
      .filter((c) => selectedCodes.has(c.code))
      .reduce((sum, c) => sum + (c.credits || 0), 0);
  }, [courses, selectedCodes]);

  const belowMin = totalCredits < MIN_CREDITS;
  const aboveMax = totalCredits > MAX_CREDITS;
  const hasError = belowMin || aboveMax;

  function toggleCourse(course) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      const isSelected = next.has(course.code);
      if (!isSelected && totalCredits + course.credits > MAX_CREDITS) {
        // Prevent going beyond max credits
        alert("Maximum " + MAX_CREDITS + " credit hours only.");
        return next;
      }
      if (isSelected) {
        next.delete(course.code);
      } else {
        next.add(course.code);
      }
      return next;
    });
  }

  function handleRegister() {
    if (hasError || selectedCodes.size === 0) {
      return;
    }

    // In a real backend, you would send this to an API with fetch/AJAX.
    // For now, we just log to console to simulate "connecting to backend".
    const payload = {
      studentName: student ? student.name : null,
      selectedCourses: courses.filter((c) => selectedCodes.has(c.code)),
      totalCredits,
    };
    console.log("Submitting registration payload:", payload);
    alert("Registration submitted. Check console for payload.");
  }

  if (loading) {
    return React.createElement(
      "div",
      { className: "cr-page cr-center" },
      "Loading courses..."
    );
  }

  if (error) {
    return React.createElement(
      "div",
      { className: "cr-page cr-center cr-error" },
      "Error: ",
      error
    );
  }

  return React.createElement(
    "div",
    { className: "cr-root" },
    React.createElement(
      "header",
      { className: "cr-topbar" },
      React.createElement(
        "div",
        { className: "cr-topbar-left" },
        React.createElement("div", { className: "cr-logo" }, "UTHM"),
        React.createElement("div", { className: "cr-title" }, "Credit Hour Less"),
        React.createElement(
          "nav",
          { className: "cr-nav" },
          "Course Registration",
          React.createElement("span", { className: "cr-nav-item" }, "Hostel Management"),
          React.createElement("span", { className: "cr-nav-item" }, "Financial Management"),
          React.createElement("span", { className: "cr-nav-item" }, "Academic Advising")
        )
      ),
      React.createElement(
        "div",
        { className: "cr-topbar-right" },
        student &&
          React.createElement(
            "div",
            { className: "cr-user" },
            React.createElement("span", { className: "cr-user-name" }, student.name),
            React.createElement("span", { className: "cr-user-role" }, student.role)
          )
      )
    ),
    React.createElement(
      "div",
      { className: "cr-body" },
      React.createElement(
        "aside",
        { className: "cr-sidebar" },
        React.createElement("div", { className: "cr-sidebar-section-title" }, "Menu"),
        React.createElement("div", { className: "cr-sidebar-item" }, "View Profile"),
        React.createElement("div", { className: "cr-sidebar-item" }, "Academic Matters"),
        React.createElement("div", { className: "cr-sidebar-item" }, "Timetable"),
        React.createElement("div", { className: "cr-sidebar-item" }, "Credit Transfer"),
        React.createElement(
          "div",
          { className: "cr-sidebar-item cr-sidebar-item--active" },
          "Course Registration"
        ),
        React.createElement("div", { className: "cr-sidebar-item" }, "Student Experience"),
        React.createElement("div", { className: "cr-sidebar-item" }, "Industrial Training")
      ),
      React.createElement(
        "main",
        { className: "cr-main" },
        React.createElement(
          "section",
          { className: "cr-search-row" },
          React.createElement(
            "div",
            { className: "cr-search-box" },
            React.createElement("input", {
              className: "cr-search-input",
              placeholder: "Search by course name, code, or lecturer...",
            })
          ),
          React.createElement(
            "button",
            { className: "cr-filter-btn" },
            "Filters"
          )
        ),
        React.createElement(
          "section",
          { className: "cr-content-row" },
          React.createElement(
            "div",
            { className: "cr-card cr-course-card" },
            React.createElement("h2", { className: "cr-card-title" }, "Available Courses"),
            React.createElement(
              "p",
              { className: "cr-card-subtitle" },
              "Showing ",
              courses.length,
              " courses"
            ),
            React.createElement(CourseTable, {
              courses,
              selectedCodes,
              onToggle: toggleCourse,
            })
          ),
          React.createElement(PendingPanel, {
            totalCredits,
            selectedCount: selectedCodes.size,
            belowMin,
            aboveMax,
            onRegister: handleRegister,
          })
        )
      )
    ),
    React.createElement(
      "footer",
      { className: "cr-footer" },
      "Copyright \u00a9 2021 LMS Dashboard"
    )
  );
}

function CourseTable(props) {
  const { courses, selectedCodes, onToggle } = props;
  return React.createElement(
    "table",
    { className: "cr-table" },
    React.createElement(
      "thead",
      null,
      React.createElement(
        "tr",
        null,
        React.createElement("th", null, "Code"),
        React.createElement("th", null, "Course Name"),
        React.createElement("th", null, "Credit Hours"),
        React.createElement("th", null, "Type"),
        React.createElement("th", null, "Section"),
        React.createElement("th", null, "Action")
      )
    ),
    React.createElement(
      "tbody",
      null,
      courses.map((course) => {
        const isSelected = selectedCodes.has(course.code);
        return React.createElement(
          "tr",
          { key: course.code },
          React.createElement("td", null, course.code),
          React.createElement(
            "td",
            null,
            React.createElement(
              "div",
              { className: "cr-course-name" },
              course.name
            ),
            React.createElement(
              "div",
              { className: "cr-course-lecturer" },
              course.lecturer
            ),
            React.createElement(
              "div",
              { className: "cr-course-schedule" },
              course.schedule
            )
          ),
          React.createElement("td", null, course.credits),
          React.createElement(
            "td",
            null,
            React.createElement(
              "span",
              { className: "cr-badge" },
              course.type
            )
          ),
          React.createElement("td", null, course.section),
          React.createElement(
            "td",
            null,
            React.createElement(
              "button",
              {
                className:
                  "cr-icon-btn" + (isSelected ? " cr-icon-btn--selected" : ""),
                onClick: () => onToggle(course),
              },
              isSelected ? "-" : "+"
            )
          )
        );
      })
    )
  );
}

function PendingPanel(props) {
  const { totalCredits, selectedCount, belowMin, aboveMax, onRegister } = props;

  let statusText = totalCredits + " / " + MAX_CREDITS + " Credits";
  let statusClass = "cr-status-normal";

  if (belowMin) {
    statusText =
      totalCredits +
      " / " +
      MAX_CREDITS +
      " Credits (Minimum " +
      MIN_CREDITS +
      ")";
    statusClass = "cr-status-warning";
  } else if (aboveMax) {
    statusText =
      totalCredits + " / " + MAX_CREDITS + " Credits (Exceeded Maximum)";
    statusClass = "cr-status-error";
  }

  return React.createElement(
    "aside",
    { className: "cr-card cr-pending-card" },
    React.createElement("h3", { className: "cr-card-title" }, "Pending Registration"),
    React.createElement(
      "p",
      { className: "cr-card-subtitle" },
      selectedCount,
      " Subjects Selected"
    ),
    React.createElement(
      "div",
      { className: "cr-credits-row" },
      React.createElement(
        "span",
        { className: "cr-credits-label" },
        statusText
      )
    ),
    aboveMax &&
      React.createElement(
        "div",
        { className: "cr-alert cr-alert-error" },
        "Not enough Credit Hour ! (Exceeded maximum)"
      ),
    belowMin &&
      React.createElement(
        "div",
        { className: "cr-alert cr-alert-warning" },
        "You must register at least ",
        MIN_CREDITS,
        " credit hours."
      ),
    React.createElement(
      "button",
      {
        className: "cr-primary-btn",
        disabled: selectedCount === 0 || belowMin || aboveMax,
        onClick: onRegister,
      },
      "Register for Courses"
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: "cr-secondary-btn",
      },
      "Save Draft"
    ),
    React.createElement(
      "div",
      { className: "cr-note" },
      React.createElement("strong", null, "Note: "),
      "Registration is subject to course availability and prerequisite requirements."
    )
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("cr-react-root");
  if (root && window.ReactDOM && window.React) {
    ReactDOM.createRoot(root).render(React.createElement(CreditRegistrationApp));
  }
});

