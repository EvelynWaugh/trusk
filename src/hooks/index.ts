import { useState, useCallback } from 'react';
import type { MediaAttachment, MediaUploadConfig } from '@/types';

export const useMediaUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = useCallback(
    (
      _config: MediaUploadConfig,
      onSelect: (attachments: MediaAttachment[]) => void
    ) => {
      if (!window.wp?.media) {
        console.error('WordPress media uploader not available');
        return;
      }

      setIsUploading(true);

      const mediaUploader = window.wp.media();

      mediaUploader.on('select', () => {
        const selection = mediaUploader.state().get('selection');
        const attachments: MediaAttachment[] = [];

        selection.each((attachment: any) => {
          const attachmentData = attachment.toJSON();
          attachments.push({
            id: attachmentData.id,
            url: attachmentData.url,
            alt: attachmentData.alt || '',
            title: attachmentData.title || '',
          });
        });

        onSelect(attachments);
        setIsUploading(false);
      });

      mediaUploader.on('close', () => {
        setIsUploading(false);
      });

      mediaUploader.open();
    },
    []
  );

  return { uploadMedia, isUploading };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};
