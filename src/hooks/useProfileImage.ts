import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
import * as userService from '../services/userService';

/**
 * Hook to handle profile image picking (camera/gallery), uploading, and state.
 */
export const useProfileImage = (uid: string | undefined, initialUri: string | null) => {
  const [profileImage, setProfileImage] = useState<string | null>(initialUri);
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleResponse = useCallback(async (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorCode) {
      if (response.errorCode === 'camera_unavailable') {
        Alert.alert('Camera Unavailable', 'Camera is not available on this device.');
      } else if (response.errorCode === 'permission') {
        Alert.alert('Permission Denied', 'Please grant camera/gallery permissions in your device settings.');
      }
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) { return; }

    const uri = Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', '');
    setProfileImage(asset.uri);

    if (!uid) { return; }

    try {
      setUploading(true);
      const downloadUrl = await userService.uploadProfileImage(uid, uri);
      setProfileImage(downloadUrl);
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      Alert.alert('Upload Failed', 'Could not upload profile image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [uid]);

  const takePhoto = useCallback(() => {
    setImageOptionsVisible(false);
    launchCamera(
      { mediaType: 'photo', quality: 0.7, maxWidth: 600, maxHeight: 600 },
      handleResponse,
    );
  }, [handleResponse]);

  const chooseFromGallery = useCallback(() => {
    setImageOptionsVisible(false);
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, maxWidth: 600, maxHeight: 600 },
      handleResponse,
    );
  }, [handleResponse]);

  const removePhoto = useCallback(async () => {
    setImageOptionsVisible(false);
    setProfileImage(null);
    if (uid) {
      try {
        await userService.updateUserProfile(uid, {
          profileImage: '',
          profile_picture_url: '',
        } as any);
      } catch (error) {
        console.error('Failed to remove profile image:', error);
      }
    }
  }, [uid]);

  const openPicker = useCallback(() => {
    setImageOptionsVisible(true);
  }, []);

  return {
    profileImage,
    setProfileImage,
    imageOptionsVisible,
    setImageOptionsVisible,
    uploading,
    openPicker,
    takePhoto,
    chooseFromGallery,
    removePhoto,
  };
};
