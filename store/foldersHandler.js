import RNFS from 'react-native-fs';

export const ensureDirectoriesExist = async (setLogMessage, contentDir1, contentDir2) => {
    try {
      const dir1Exists = await RNFS.exists(contentDir1);
      const dir2Exists = await RNFS.exists(contentDir2);
      if (!dir1Exists) await RNFS.mkdir(contentDir1);
      if (!dir2Exists) await RNFS.mkdir(contentDir2);
      setLogMessage((prevLog) => prevLog + '\nContent directories verified.');
    } catch (error) {
      setLogMessage((prevLog) => prevLog + `\nFailed to ensure directories: ${error.message}`);
    }
  };

export const deleteFolder = async (setLogMessage, folder, contentDir1, contentDir2) => {
    const folderPath = folder === 'Content1' ? contentDir1 : contentDir2;
    try {
      if (await RNFS.exists(folderPath)) {
        await RNFS.unlink(folderPath);
        setLogMessage((prevLog) => prevLog + `\n${folder} deleted.`);
      }
      await RNFS.mkdir(folderPath);
      setLogMessage((prevLog) => prevLog + `\n${folder} recreated.`);
    } catch (error) {
      setLogMessage((prevLog) => prevLog + `\nFailed to delete ${folder}: ${error.message}`);
    }
  };
