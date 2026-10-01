import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.6,
  allowsMultipleSelection: false,
};

// Picks (or captures) an image and copies it into the app's document directory
// so it survives the picker's temporary cache being cleared. Returns the
// permanent file URI, or null if the user cancelled / denied permission.
export async function pickInvoicePhotoAsync(source: 'camera' | 'library'): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Permission to access photos was denied.');

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || result.assets.length === 0) return null;

  const directory = new Directory(Paths.document, 'invoices');
  directory.create({ idempotent: true, intermediates: true });

  const original = new File(result.assets[0].uri);
  const extension = original.extension || '.jpg';
  const destination = new File(directory, `invoice-${Date.now()}${extension}`);
  original.copy(destination);
  return destination.uri;
}

export function deleteInvoicePhotoFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // File already gone — nothing to clean up.
  }
}

export async function readPhotoAsDataUriAsync(uri: string): Promise<string | null> {
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    const mime = file.extension.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${await file.base64()}`;
  } catch {
    return null;
  }
}
