import Holidays from 'date-holidays';

const holidayService = {
  // Initialize holidays for US
  hd: new Holidays('US'),

  // Get holidays for a specific month and year
  getMonthHolidays: (date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const allHolidays = holidayService.hd.getHolidays(year);
      
      const monthHolidays = allHolidays
        .filter(holiday => {
          const holidayDate = new Date(holiday.date);
          return holidayDate.getMonth() === month;
        })
        .map(holiday => {
          const startDate = new Date(holiday.date);
          startDate.setHours(0, 0, 0, 0);  
          
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);  
          
          return {
            id: `holiday-${holiday.date}`,
            title: holiday.name,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            calendar: 'holidays',
            isHoliday: true,
            type: holiday.type,
            draggable: false,
            allDay: true,
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        });

      return monthHolidays;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }
  },

  // Get holidays for a specific year
  getYearHolidays: (year) => {
    try {
      const allHolidays = holidayService.hd.getHolidays(year);
      
      return allHolidays.map(holiday => {
        const startDate = new Date(holiday.date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        return {
          id: `holiday-${holiday.date}`,
          title: holiday.name,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          calendar: 'holidays',
          isHoliday: true,
          type: holiday.type,
          draggable: false,
          allDay: true,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      });
    } catch (error) {
      console.error('Error fetching year holidays:', error);
      return [];
    }
  },

  // Check if a specific date is a holiday
  isHoliday: (date) => {
    try {
      return holidayService.hd.isHoliday(date);
    } catch (error) {
      console.error('Error checking holiday:', error);
      return false;
    }
  },

  // Get holiday info for a specific date if it exists
  getHolidayInfo: (date) => {
    try {
      const holiday = holidayService.hd.isHoliday(date);
      if (!holiday) return null;

      const startDate = new Date(holiday[0].date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      return {
        id: `holiday-${holiday[0].date}`,
        title: holiday[0].name,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        calendar: 'holidays',
        isHoliday: true,
        type: holiday[0].type,
        draggable: false,
        allDay: true,
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    } catch (error) {
      console.error('Error getting holiday info:', error);
      return null;
    }
  },

  // Change country/state if needed
  setLocation: (country, state = null) => {
    try {
      holidayService.hd = new Holidays(country, state);
      return true;
    } catch (error) {
      console.error('Error setting location:', error);
      return false;
    }
  },

  // Get all supported countries
  getSupportedCountries: () => {
    try {
      return holidayService.hd.getCountries();
    } catch (error) {
      console.error('Error getting supported countries:', error);
      return {};
    }
  },

  // Get all supported states for a country
  getSupportedStates: (country) => {
    try {
      return holidayService.hd.getStates(country);
    } catch (error) {
      console.error('Error getting supported states:', error);
      return {};
    }
  },

  // Get next upcoming holiday
  getNextHoliday: () => {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const holidays = holidayService.hd.getHolidays(currentYear);
      
      // Find next holiday
      const nextHoliday = holidays.find(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= today;
      });

      if (!nextHoliday) {
        // If no holidays left this year, get first holiday of next year
        const nextYearHolidays = holidayService.hd.getHolidays(currentYear + 1);
        return nextYearHolidays[0];
      }

      return nextHoliday;
    } catch (error) {
      console.error('Error getting next holiday:', error);
      return null;
    }
  }
};

export default holidayService;