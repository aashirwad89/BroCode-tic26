import * as Location from 'expo-location';
import { socket } from '@/services/socket';

export const startSharing = async (sessionId: string) => {
  await Location.requestForegroundPermissionsAsync();

  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 3000,
      distanceInterval: 5,
    },
    (location) => {
      socket.emit("send-location", {
        sessionId,
        coords: location.coords,
      });
    }
  );
};