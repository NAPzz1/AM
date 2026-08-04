import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "./env";

// Fix Supabase Realtime WebSocket issue on Node 20
(global as any).WebSocket = WebSocket;

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY
);