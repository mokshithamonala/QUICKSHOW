export const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
};
