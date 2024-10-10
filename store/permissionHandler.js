import RNFS from 'react-native-fs';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

 const requestStoragePermission = async (setLogMessage) => {
    let permission;

    if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }

    const result = await check(permission);

    if (result === RESULTS.DENIED) {
      const newResult = await request(permission);
      return await handlePermissionResult(newResult, setLogMessage);
    } else {
      setLogMessage((prevLog) => prevLog + "\nPermission required");
      return await handlePermissionResult(result, setLogMessage);
    }
};

const handlePermissionResult = async (result, setLogMessage) => {
    if (result === RESULTS.GRANTED) {
      setLogMessage('\nStorage permission granted');
      return await findUsbStorage(setLogMessage);
    } else {
      setLogMessage((prevLog) => prevLog + '\nStorage permission denied');
      return getDefaultPaths(); 
    }
};

const findUsbStorage = async (setLogMessage) => {
    try {
        const dirs = await RNFS.getAllExternalFilesDirs();
        const usbPath = dirs.find(path => path && path.includes('sda1')); // SDA 1 порт в приставке НЕ ЗАБЫТЬ ДОБАВИТЬ ДЛЯ SDA 2. Карта памяти - проверить
        if (usbPath) {
            setLogMessage((prevLog) => prevLog + `\nUSB found at: ${usbPath}`);
            return getUsbPaths(usbPath);
        } else {
            setLogMessage((prevLog) => prevLog + '\nNo USB found');
            return getDefaultPaths();
        }
    } catch (err) {
        setLogMessage((prevLog) => prevLog + `\nError getting external storage paths: ${err}`);
        return getDefaultPaths();
    }
};

const getUsbPaths = (usbPath) => {
    return {
        contentDir1: `${usbPath}/Content1`,
        contentDir2: `${usbPath}/Content2`,
        configPath1: `${usbPath}/Content1/config.json`,
        configPath2: `${usbPath}/Content2/config.json`
    };
};

const getDefaultPaths = () => {
    return {
        contentDir1: `${RNFS.ExternalDirectoryPath}/Content1`,
        contentDir2: `${RNFS.ExternalDirectoryPath}/Content2`,
        configPath1: `${RNFS.ExternalDirectoryPath}/Content1/config.json`,
        configPath2: `${RNFS.ExternalDirectoryPath}/Content2/config.json`
    };
};

export default requestStoragePermission;