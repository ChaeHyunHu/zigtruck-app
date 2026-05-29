import { useEffect, useState } from "react";

import { fetchChatRoomList } from "@/src/api/chat/getChat";
import { useAuth } from "@/src/hooks/useAuth";

export function useHasChatRooms() {
  const { isAuthenticated } = useAuth();
  const [hasChatRooms, setHasChatRooms] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasChatRooms(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const data = await fetchChatRoomList();
        if (mounted) {
          setHasChatRooms(Array.isArray(data) && data.length > 0);
        }
      } catch {
        if (mounted) setHasChatRooms(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return hasChatRooms;
}
