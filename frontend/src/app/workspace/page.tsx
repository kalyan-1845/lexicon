import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import PDFUploader from "@/components/PDFUploader";

export default function Workspace() {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <ChatArea />
      <PDFUploader />
    </div>
  );
}
