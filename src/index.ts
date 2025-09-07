export function calculateEventsPerPage(): number {
    const width = window.innerWidth;
  
    if (width < 640) { // Smaller devices (mobile)
      return 1;
    } else if (width >= 640 && width < 768) { // Small devices (landscape phones)
      return 2;
    } else if (width >= 768 && width < 1024) { // Tablets
      return 3;
    } else if (width >= 1024 && width < 1280) { // Laptops/small screens
      return 5;
    } else { // Larger desktops
      return 8;
    }
  }
  
export function calculateScoreCardsOnHome(): number {
  const width = window.innerWidth;
  // Conservative counts optimized for mobile-first visibility
  if (width < 640) { // mobile
    return 2;
  } else if (width < 768) { // sm
    return 4;
  } else if (width < 1024) { // md
    return 6;
  } else if (width < 1280) { // lg
    return 8;
  } else { // xl+
    return 12;
  }
}
