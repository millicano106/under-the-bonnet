import { Alert } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { deleteCar } from '../db/repository/cars';
import { listInvoicePhotosByCar } from '../db/repository/invoicePhotos';
import type { Car } from '../db/types';
import { deleteInvoicePhotoFile } from './invoicePhotos';
import { cancelReminderNotificationsForCarAsync } from './notifications';

// Confirms, then removes the car along with its reminders' OS notifications and
// invoice photo files (the DB rows cascade automatically).
export function confirmDeleteCar(db: SQLiteDatabase, car: Car, onDeleted: () => void) {
  Alert.alert(
    'Delete car?',
    `This permanently removes "${car.name}" and all its components, schedule, log entries and invoice photos.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const photos = await listInvoicePhotosByCar(db, car.id);
            await cancelReminderNotificationsForCarAsync(db, car.id);
            await deleteCar(db, car.id);
            photos.forEach((photo) => deleteInvoicePhotoFile(photo.uri));
            onDeleted();
          } catch (error) {
            Alert.alert('Could not delete car', error instanceof Error ? error.message : String(error));
          }
        },
      },
    ]
  );
}
