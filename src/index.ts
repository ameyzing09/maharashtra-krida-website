export function calculateEventsPerPage(): number {
    const width = window.innerWidth;
  
    if (width < 640) { // Smaller devices (mobile)
      return 1;
    } else if (width >= 640 && width < 768) { // Small devices (landscape phones)
      return 2;
    } else if (width >= 768 && width < 1024) { // Tablets
      return 2;
    } else if (width >= 1024 && width < 1280) { // Laptops/small screens
      return 3;
    } else { // Larger desktops
      return 4;
    }
  }
  