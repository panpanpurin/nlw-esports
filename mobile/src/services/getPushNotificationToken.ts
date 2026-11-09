import * as Notifications from 'expo-notifications';

export async function getPushNotificationToken() {
    let { granted } = await Notifications.getPermissionsAsync();

    if (!granted) {
        ({ granted } = await Notifications.requestPermissionsAsync());
    }

    if (!granted) {
        return;
    }

    const pushToken = await Notifications.getExpoPushTokenAsync();
    console.log('NOTIFICATION TOKEN =>', pushToken.data);

    return pushToken.data;
}
