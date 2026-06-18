import Echo from "laravel-echo";
import Pusher from "pusher-js";

if (typeof window !== "undefined") {
  // @ts-ignore
  window.Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

export const getEcho = () => {
  if (typeof window === "undefined") return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "ebqjb5gcbwrmlk428asd",
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "api.PinjemLur.my.id",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 443),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 443),
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
    });
  }

  return echoInstance;
};
