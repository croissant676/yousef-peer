import {changeHostLobbyState, currentResolve, id, initHostLobbyData, isServer, sendChatMsg} from "./internalServer";
import {attemptSetName, clientSend, conn, isTimeForDraw, justDrew} from "./clientSide";
import type {CardSelect, ChatMessageData, ClientMessageData, DrawSelect} from "./common";
import {hostName, initHostname} from "./host";

export async function setName(name: string): Promise<boolean> {
    if (isServer) {
        initHostname(name);
        await initHostLobbyData()
        return true;
    }
    return await attemptSetName(name)
}

export async function sendMessage(data: string) {
    if (isServer) {
        let chatMsgData: ChatMessageData = {
            '_type': 'in_msg',
            sender: hostName,
            data: data
        };
        await sendChatMsg(chatMsgData)
    } else {
        await clientSend({'_type': 'msg', data: data} as ClientMessageData)
    }
}

export function getRoomCode(): string {
    if (isServer)
        return id!;
    return conn!.peer
}

export async function changeLobbyReadyState() {
    if (isServer) {
        await changeHostLobbyState();
    } else {
        await clientSend({'_type': 'lobby_rd'});
    }
}

export async function sendCards(handIndices: number[]) {
    if (isServer) {
        currentResolve(handIndices);
    } else {
        await clientSend({'_type': 'card_select', hands: handIndices} as CardSelect)
    }
}

export async function call() {
    await sendCards([]); // empty means they are calling.
    isTimeForDraw.set(true);
}

export async function selectDrawLoc(isDeck: boolean) {
    if (isServer) {
        currentResolve(isDeck);
    } else {
        await clientSend({'_type': 'draw_select', 'value': isDeck ? 'deck' : 'pile'} as DrawSelect)
    }
    isTimeForDraw.set(false);
    justDrew.set(true);
}