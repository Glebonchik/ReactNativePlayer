import { SERVERADRESS } from "./config";

const fetchMediaFiles = async (setLogMessage) => {
    try {
      const response = await fetch(SERVERADRESS);
      if (response.status !== 200) {
        setLogMessage((prevLog) => prevLog + `\nServer error: ${response.status}`);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setLogMessage((prevLog) => prevLog + `\nFailed to connect to server: ${error.message}`);
      return null;
    }
  };

export default fetchMediaFiles;