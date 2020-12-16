import { MessageSender, Pause } from "../../../entry";

export const buildCommunicator = (
        messageSender: MessageSender | undefined,
        pause: Pause
    ): ITicketTranslationMessageSender => {
    if (!messageSender) {
        return new DummyMessageSender();
    } else {
        return new RealMessageSender(messageSender, pause);
    }
};

export interface ITicketTranslationMessageSender {
    setup(ticket: number[]): Promise<void>;
    foundLabel(label: string, index: number): Promise<void>;
}

type PrivateTicketTranslationMessage = {
    type: "setup";
    ticket: number[];
} | {
    type: "label";
    index: number;
    label: string;
};

export type TicketTranslationMessage = {kind: "TicketTranslationMessage"} & PrivateTicketTranslationMessage;

const buildMessage = (message: PrivateTicketTranslationMessage): TicketTranslationMessage => {
    return {
        ...message,
        kind: "TicketTranslationMessage"
    };
};

export function isTicketTranslationMessage(message: any): message is TicketTranslationMessage {
    return (message as TicketTranslationMessage).kind === "TicketTranslationMessage";
}

class RealMessageSender implements ITicketTranslationMessageSender {
    constructor(private readonly messageSender: MessageSender, private readonly pause: Pause) { }

    public async setup(ticket: number[]) {
        this.messageSender(buildMessage({
            type: "setup",
            ticket
        }));
        await this.pause();
    }

    public async foundLabel(label: string, index: number) {
        this.messageSender(buildMessage({
            type: "label",
            index,
            label
        }));
        await this.pause();
    }
}

class DummyMessageSender implements ITicketTranslationMessageSender {
    public async setup(ticket: number[]): Promise<void> { }
    public async foundLabel(label: string, index: number): Promise<void> { }

}
