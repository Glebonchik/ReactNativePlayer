import { StyleSheet, Dimensions } from "react-native";

export const styles = StyleSheet.create({
    container: { 
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    mediaContainer: { 
      width: '100%', 
      height: Dimensions.get('window').height,
      position: 'absolute', 
      top: 0, 
      left: 0 
    },
    media: { 
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      position: 'absolute', 
      top: 0, 
      left: 0 
    },
    logMessage: {
      position: 'absolute',
      bottom: 20,
      color: '#000',
    },
  });
