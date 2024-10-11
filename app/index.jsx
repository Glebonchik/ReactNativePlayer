import { useState, useEffect, useRef } from 'react';
import { ScrollView, Alert, Animated, Text, BackHandler } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Video } from 'expo-av';

import {ensureDirectoriesExist, deleteFolder} from '@/store/foldersHandler';
import fetchMediaFiles from '@/helpers/apiHandler';
import requestStoragePermission from '@/store/permissionHandler';
import { saveConfigFile, loadConfigFile, checkExistingFiles, downloadAllMedia } from '@/store/filesHandler';
import getInactiveFolder from '@/utils/getInactiveFolder';
import { stopMediaPlayback, playMedia } from '@/controllers/playbackController';
import {styles} from '@/styles/styles';

export default function App() {
  useKeepAwake();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [fileUris, setFileUris] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [showMedia, setShowMedia] = useState(false);
  const [logMessage, setLogMessage] = useState('Starting app...');
  const activeFolderRef = useRef('Content1');
  const translateX = useRef(new Animated.Value(0)).current;
  const mediaTimeoutRef = useRef(null);
  const playMediaData = { setLogMessage, setFileType, setShowMedia, fileUris, setCurrentMediaIndex,currentMediaIndex, mediaTimeoutRef, translateX };
  const dataToDownloadMedia = [setLogMessage, setFileUris, activeFolderRef.current, contentDir1, contentDir2, configPath1, configPath2];

  let contentDir1;
  let contentDir2;
  let configPath1;
  let configPath2;

  const updateContent = async () => {
    const response = await fetchMediaFiles(setLogMessage);
    if (response) {
      stopMediaPlayback(setShowMedia, setLogMessage, mediaTimeoutRef);

      const inactiveFolder = getInactiveFolder(activeFolderRef); 
      setLogMessage((prevLog) => prevLog + `\nInactive folder: ${inactiveFolder}`);

      await deleteFolder(setLogMessage, inactiveFolder, contentDir1, contentDir2);
      await saveConfigFile(response, setLogMessage, inactiveFolder, configPath1,configPath2); 
      setLogMessage((prevLog) => prevLog + `\nConfig saved in ${inactiveFolder}, starting download.`);

      await downloadAllMedia(setLogMessage, setFileUris, inactiveFolder, contentDir1, contentDir2, configPath1, configPath2);

      activeFolderRef.current = inactiveFolder; 
      setLogMessage((prevLog) => prevLog + `\nActive folder switched to: ${inactiveFolder}`);

      setCurrentMediaIndex(0);
      playMedia(playMediaData); 
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchInitialContent = async () => {
      try {
        if (await fetchMediaFiles(setLogMessage)) {
          await updateContent(); 
        }
        else{
          setLogMessage('');
        }
      } catch (error) {
        setLogMessage((prevLog) => prevLog + `\nServer check failed: ${error.message}`);
      }
    };
  
    fetchInitialContent(); 
  
    const interval = setInterval(async () => {
      try {
        if (await fetchMediaFiles(setLogMessage)) {
          await updateContent();
        }
        else{
          setLogMessage('');
        }
      } catch (error) {
        setLogMessage((prevLog) => prevLog + `\nServer check failed: ${error.message}`);
      }
    }, 300000); 
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    const prepareMedia = async () => {
      setLogMessage((prevLog) => prevLog + '\nPreparing media...');

      const paths = await requestStoragePermission(setLogMessage);
      contentDir1 = paths.contentDir1;
      contentDir2 = paths.contentDir2;
      configPath1 = paths.configPath1;
      configPath2 = paths.configPath2;
      setLogMessage((prevLog) => prevLog + `\nContentDir1: ${contentDir1}`)
      setLogMessage((prevLog) => prevLog + `\nContentDir2: ${contentDir2}`)
      

      let config = await loadConfigFile(setLogMessage, activeFolderRef.current, configPath1, configPath1);
      if (!config) {
        await ensureDirectoriesExist(setLogMessage, contentDir1, contentDir2);
        const mediaFromAPI = await fetchMediaFiles(setLogMessage);
        if (mediaFromAPI) {
          await saveConfigFile(mediaFromAPI, setLogMessage, activeFolderRef.current, configPath1, configPath2);
          config = mediaFromAPI;
        }
      }

      if (!(await checkExistingFiles(dataToDownloadMedia))) {
        await downloadAllMedia(dataToDownloadMedia);
      }
      playMedia(playMediaData);
    };

    if (fileUris.length === 0) {
      prepareMedia();
    } else {
      playMedia(playMediaData);
    }
  }, [currentMediaIndex, fileUris]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showMedia && (
        <Animated.View style={[styles.mediaContainer, { transform: [{ translateX }] }]}>
          {fileType === 'png' || fileType === 'jpg' ? (
            <Animated.Image source={{ uri: fileUris[currentMediaIndex].uri }} style={styles.media} resizeMode="cover" />
          ) : (
            <Video source={{ uri: fileUris[currentMediaIndex].uri }} shouldPlay style={styles.media} resizeMode="cover" />
          )}
        </Animated.View>
      )}
      <Text style={styles.logMessage}>{logMessage}</Text>
    </ScrollView>
  );
}
