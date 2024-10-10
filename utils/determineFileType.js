const determineFileType = (url) => {
  const extension = url.split('.').pop().toLowerCase();
  return extension;
};

export default determineFileType;