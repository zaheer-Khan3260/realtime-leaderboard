const getTimestamp = (dateTime) => {
    let timestamp;
    if (dateTime instanceof Date) {
        timestamp = dateTime.getTime(); 
    } else if (typeof dateTime === 'number') {
        timestamp = dateTime; 
    } else {
        timestamp = Date.now(); 
    }
    return Math.floor(timestamp / 1000); 
};

export { getTimestamp };