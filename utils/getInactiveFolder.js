const getInactiveFolder = (activeFolderRef) => {
  return activeFolderRef.current === 'Content1' ? 'Content2' : 'Content1';
};

export default getInactiveFolder;