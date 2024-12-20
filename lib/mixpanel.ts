import { Mixpanel } from "mixpanel-react-native";

// create an instance of Mixpanel using your project token
// disable legacy autotrack mobile events

const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

if (!token) {
  throw new Error("EXPO_PUBLIC_MIXPANEL_TOKEN is not set");
}
const trackAutomaticEvents = false;
const mixpanel = new Mixpanel(token, trackAutomaticEvents);

//initialize Mixpanel
mixpanel.init();

export default mixpanel;
