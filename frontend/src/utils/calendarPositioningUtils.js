const getEventTime = (dateStr) => new Date(dateStr).getTime();

const areExactTimeMatch = (event1, event2) => {
  const start1 = getEventTime(event1.start_time);
  const start2 = getEventTime(event2.start_time);
  const end1 = getEventTime(event1.end_time);
  const end2 = getEventTime(event2.end_time);
  
  return start1 === start2 && end1 === end2;
};

const isContainedWithin = (event, container) => {
  const eventStart = getEventTime(event.start_time);
  const eventEnd = getEventTime(event.end_time);
  const containerStart = getEventTime(container.start_time);
  const containerEnd = getEventTime(container.end_time);
  return eventStart >= containerStart && eventEnd <= containerEnd;
};

const eventsOverlap = (event1, event2) => {
  const start1 = getEventTime(event1.start_time);
  const end1 = getEventTime(event1.end_time);
  const start2 = getEventTime(event2.start_time);
  const end2 = getEventTime(event2.end_time);
  return start1 < end2 && end1 > start2;
};

export const calculateEventColumns = (events) => {
  // First identify and group exact time matches
  const exactTimeGroups = new Map();
  const nonExactTimeEvents = [];

  // First pass: group exact time matches
  events.forEach(event => {
    const timeKey = `${event.start_time}-${event.end_time}`;
    const existingGroup = exactTimeGroups.get(timeKey);
    
    if (existingGroup) {
      existingGroup.push(event);
    } else {
      // Check if this event matches with any other
      const matches = events.filter(e => 
        e.id !== event.id && areExactTimeMatch(e, event)
      );
      
      if (matches.length > 0) {
        exactTimeGroups.set(timeKey, [event, ...matches]);
      } else {
        nonExactTimeEvents.push(event);
      }
    }
  });

  const positions = new Map();

  // Handle exact time matches
  exactTimeGroups.forEach((group) => {
    const width = 96 / group.length;
    group.forEach((event, index) => {
      positions.set(event.id, {
        column: index,
        totalColumns: group.length,
        isExactMatch: true,
        width: `${width}%`,
        left: `${index * width}%`
      });
    });
  });

  // Handle overlapping events
  if (nonExactTimeEvents.length > 0) {
    const columns = [];
    
    nonExactTimeEvents.forEach(event => {
      let placed = false;
      let colIndex = 0;

      while (!placed) {
        if (!columns[colIndex]) {
          columns[colIndex] = [event];
          positions.set(event.id, {
            column: colIndex,
            totalColumns: 1,
            width: '96%',
            left: '0%'
          });
          placed = true;
        } else {
          const canPlaceInColumn = columns[colIndex].every(existing => 
            !eventsOverlap(event, existing)
          );

          if (canPlaceInColumn) {
            columns[colIndex].push(event);
            positions.set(event.id, {
              column: colIndex,
              totalColumns: columns.length,
              width: `${96 / columns.length}%`,
              left: `${(colIndex * 96) / columns.length}%`
            });
            placed = true;
          } else {
            colIndex++;
          }
        }
      }

      // Update all events in columns with new widths
      columns.forEach((colEvents, colIdx) => {
        colEvents.forEach(colEvent => {
          const pos = positions.get(colEvent.id);
          if (!pos.isExactMatch) {
            const totalColumns = columns.length;
            const width = 96 / totalColumns;
            pos.totalColumns = totalColumns;
            pos.width = `${width}%`;
            pos.left = `${colIdx * width}%`;
          }
        });
      });
    });
  }

  return positions;
};

export const processEvents = (events) => {
  const segments = [];
  const processed = new Set();

  // Find container events first
  const containers = events.filter(event => {
    const containedEvents = events.filter(e => 
      e.id !== event.id && isContainedWithin(e, event)
    );
    return containedEvents.length > 0;
  });

  // Process containers and their events
  containers.forEach(container => {
    segments.push({
      event: container,
      isContainer: true,
      left: '0%',
      width: '100%',
      zIndex: 5
    });
    processed.add(container.id);

    const containedEvents = events.filter(event => 
      !processed.has(event.id) && 
      isContainedWithin(event, container)
    );

    if (containedEvents.length > 0) {
      const positions = calculateEventColumns(containedEvents);
      containedEvents.forEach(event => {
        const pos = positions.get(event.id);
        const baseLeft = 4;
        const adjustedWidth = 92;
        
        segments.push({
          event,
          isContained: true,
          left: `${baseLeft + parseFloat(pos.left) * (adjustedWidth/96)}%`,
          width: `${parseFloat(pos.width) * (adjustedWidth/96)}%`,
          zIndex: 10 + pos.column
        });
        processed.add(event.id);
      });
    }
  });

  // Process remaining events
  const remainingEvents = events.filter(e => !processed.has(e.id));
  if (remainingEvents.length > 0) {
    const positions = calculateEventColumns(remainingEvents);
    remainingEvents.forEach(event => {
      const pos = positions.get(event.id);
      segments.push({
        event,
        left: pos.left,
        width: pos.width,
        zIndex: 15 + pos.column
      });
    });
  }

  return segments;
};