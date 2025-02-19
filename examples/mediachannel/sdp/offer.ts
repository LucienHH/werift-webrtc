import { Server } from "ws";
import {
  RTCPeerConnection,
  type RTCRtpTransceiver,
} from "../../../packages/webrtc/src";

const server = new Server({ port: 8888 });
console.log("start");

server.on("connection", async (socket) => {
  const pc = new RTCPeerConnection({});

  const onTransceiver = async (transceiver: RTCRtpTransceiver) => {
    const [track] = await transceiver.onTrack.asPromise();
    await transceiver.sender.replaceTrack(track);

    setInterval(() => {
      transceiver.receiver.sendRtcpPLI(track.ssrc);
    }, 3000);
  };

  onTransceiver(pc.addTransceiver("video"));
  pc.onRemoteTransceiverAdded.subscribe(onTransceiver);

  await pc.setLocalDescription(await pc.createOffer());
  const sdp = JSON.stringify(pc.localDescription);
  socket.send(sdp);

  const data = await new Promise<string>(
    (r) => (socket.onmessage = (ev) => r(ev.data.toString())),
  );
  await pc.setRemoteDescription(JSON.parse(data));

  socket.onmessage = async ({ data }) => {
    const offer = JSON.parse(data.toString());
    onTransceiver(pc.addTransceiver("video"));
    await pc.setRemoteDescription(offer);

    await pc.setLocalDescription(await pc.createAnswer());
    socket.send(JSON.stringify(pc.localDescription));
  };
});
