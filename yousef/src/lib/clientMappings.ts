import {changeHostLobbyState, id, initHostLobbyData, isServer, sendChatMsg} from "./internalServer";
import {attemptSetName, clientSend, conn, messages} from "./clientSide";
import type {ChatMessageData, ClientMessageData, ClientNameSetData, CommData} from "./common";
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