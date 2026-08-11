import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';

export async function shareContent(input: { title?: string; text?: string; url?: string }) {
  const canShare = await Share.canShare();
  if (!canShare.value) {
    throw new Error('Native sharing is not available on this device.');
  }

  await Share.share({
    title: input.title,
    text: input.text,
    url: input.url,
    dialogTitle: input.title ?? 'Share',
  });
}

export async function takePhoto() {
  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    saveToGallery: false,
    correctOrientation: true,
  });

  return {
    webPath: photo.webPath,
    format: photo.format,
  };
}

export async function pickPhoto() {
  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    correctOrientation: true,
  });

  return {
    webPath: photo.webPath,
    format: photo.format,
  };
}
