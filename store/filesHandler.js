import RNFS from 'react-native-fs';
import determineFileType from '@/utils/determineFileType';
import { Alert } from 'react-native';

export const saveConfigFile = async (data, setLogMessage, folder, configPath1, configPath2) => {
    try {
      const configPath = folder === 'Content1' ? configPath1 : configPath2;
      await RNFS.writeFile(configPath, JSON.stringify(data), 'utf8');
      setLogMessage((prevLog) => prevLog + `\nConfig file saved in ${folder}.`);
    } catch (error) {
      setLogMessage((prevLog) => prevLog + `\nFailed to save config file in ${folder}: ${error.message}`);
    }
  };

export const loadConfigFile = async (setLogMessage, folder, configPath1, configPath2) => {
    try {
      const configPath = folder === 'Content1' ? configPath1 : configPath2;
      if (await RNFS.exists(configPath)) {
        const configContent = await RNFS.readFile(configPath, 'utf8');
        const parsedConfig = JSON.parse(configContent);
        setLogMessage((prevLog) => prevLog + `\nConfig file loaded from ${folder}: ${JSON.stringify(parsedConfig)}`);
        return parsedConfig;
      }
      setLogMessage((prevLog) => prevLog + `\nConfig file not found in ${folder}.`);
      return null;
    } catch (error) {
      setLogMessage((prevLog) => prevLog + `\nFailed to read config file in ${folder}: ${error.message}`);
      return null;
    }
  };

export const checkExistingFiles = async (setLogMessage, setFileUris, folder, contentDir1, contentDir2, configPath1, configPath2) => {
    try {
      const uris = [];
      const contentDir = folder === 'Content1' ? contentDir1 : contentDir2;
      const files = await RNFS.readDir(contentDir);
      const config = await loadConfigFile(setLogMessage, folder, configPath1,configPath2);

      if (config) {
        for (const file of files) {
          if (file.name !== 'config.json') {
            const matchedMedia = config.find(item => file.name.startsWith(item._id));
            if (matchedMedia) {
              const type = determineFileType(file.name);
              uris.push({ uri: 'file://' + file.path, type, duration: matchedMedia.duration });
            }
          }
        }

        if (uris.length === config.length) {
          setFileUris(uris);
          setLogMessage((prevLog) => prevLog + `\nExisting files checked in ${folder}.`);
          return true;
        }
      }
      return false;
    } catch (error) {
      setLogMessage((prevLog) => prevLog + `\nError checking existing files in ${folder}: ${error.message}`);
      return false;
    }
  };

export const downloadAllMedia = async (setLogMessage, setFileUris, folder, contentDir1, contentDir2, configPath1, configPath2) => {
    const uris = [];
    const contentDir = folder === 'Content1' ? contentDir1 : contentDir2;
    const config = await loadConfigFile(setLogMessage, folder, configPath1, configPath2);
    setLogMessage((prevLog) => prevLog + `\nConfig for ${folder}: ${JSON.stringify(config)}`);
    if (!config) {
      setLogMessage((prevLog) => prevLog + `\nNo config available for media download in ${folder}.`);
      return;
    }
    try {
      for (const file of config) {
        setLogMessage((prevLog) => prevLog + `\nDownloading ${file._id} to ${folder}`);
        const type = determineFileType(file.url);
        const fileName = `${contentDir}/${file._id}.${type}`;

        const { promise } = RNFS.downloadFile({ fromUrl: file.url, toFile: fileName });
        const result = await promise;

        if (result.statusCode === 200) {
          uris.push({ uri: 'file://' + fileName, type, duration: file.duration });
          setLogMessage((prevLog) => prevLog + `\nDownloaded ${fileName}.`);
        } else {
          setLogMessage((prevLog) => prevLog + `\nFailed to download ${file.url}`);
        }
      }
    } catch (error) {
      Alert.alert('Download failed', error.message);
      return;
    }

    setFileUris(uris);
  };