import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
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
      if (response.errorCode === 'permission') {
        Alert.alert('Permission Denied', 'Please grant gallery permissions in your device settings.');
      }
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri || !asset?.base64) { return; }

    // Build data URL (matching web approach — store base64 directly in Firestore)
    const mime = asset.type || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;
    setProfileImage(dataUrl);

    if (!uid) { return; }

    try {
      setUploading(true);
      await userService.updateUserProfile(uid, {
        profileImage: dataUrl,
        profile_picture_url: dataUrl,
      } as any);
    } catch (error) {
      console.error('Failed to update profile image:', error);
      Alert.alert('Upload Failed', 'Could not save profile image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [uid]);

  const chooseFromGallery = useCallback(() => {
    setImageOptionsVisible(false);
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, maxWidth: 600, maxHeight: 600, includeBase64: true },
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
    chooseFromGallery,
    removePhoto,
  };
};
