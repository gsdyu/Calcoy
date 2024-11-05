export const handleTimeSlotDoubleClick = (e, day, hour, onDateDoubleClick) => {
    e.preventDefault();
    
    const clickedElement = e.currentTarget;
    const rect = clickedElement.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const isBottomHalf = clickY > rect.height / 2;
    
    const clickedDate = new Date(day);
    clickedDate.setHours(hour);
    clickedDate.setMinutes(isBottomHalf ? 30 : 0);
    clickedDate.setSeconds(0);
    clickedDate.setMilliseconds(0);
    
    onDateDoubleClick(clickedDate, false);
  };