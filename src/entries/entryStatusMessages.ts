type MessageType = "Timeout" | "Any";
export type Message = TimeoutMessage | AnyMessage;

interface BaseMessage {
    messageType: MessageType;
}

export function isTimeoutMessage(m: Message): m is TimeoutMessage {
    return m.messageType === "Timeout";
}

export function isAnyMessage(m: Message): m is AnyMessage {
    return m.messageType === "Any";
}
export interface TimeoutMessage extends BaseMessage {
    messageType: "Timeout";
    timeout: number;
}

export interface AnyMessage extends BaseMessage {
    messageType: "Any";
    payload: any;
}
