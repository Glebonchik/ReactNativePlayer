import { Animated, Dimensions } from "react-native";

export const stopMediaPlayback = (setShowMedia, setLogMessage, mediaTimeoutRef) => {
    setShowMedia(false);
    setLogMessage((prevLog) => prevLog + '\nMedia playback stopped.');
    if (mediaTimeoutRef.current) {
      clearTimeout(mediaTimeoutRef.current);
      mediaTimeoutRef.current = null;
    }
  };

export const playMedia = ({ setLogMessage, setFileType, setShowMedia, fileUris, setCurrentMediaIndex,currentMediaIndex, mediaTimeoutRef, translateX }) => {
    const { uri, type, duration } = fileUris[currentMediaIndex];
    setLogMessage('');
    setFileType(type);
    setShowMedia(true);

    if (mediaTimeoutRef.current) {
      clearTimeout(mediaTimeoutRef.current);
    }

    mediaTimeoutRef.current = setTimeout(() => {
        swipeToNextMedia(setShowMedia, setCurrentMediaIndex, translateX, fileUris);
    }, duration * 1000);
  };

  const swipeToNextMedia = (setShowMedia, setCurrentMediaIndex, translateX, fileUris) => {
    const { width: screenWidth } = Dimensions.get('window');
    Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 500,
        useNativeDriver: true,
    }).start(() => {
        setShowMedia(false);
        setCurrentMediaIndex((prev) => (prev + 1) % fileUris.length);
        setTimeout(() => {
            translateX.setValue(screenWidth);
            setShowMedia(true);
            Animated.timing(translateX, { toValue: 0, duration: 500, useNativeDriver: true }).start();
        }, 500);
    });
};
