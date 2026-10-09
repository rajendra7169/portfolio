// TEMPORARY: engine test bench for the day-1 gate. Deleted before shipping.
import DustProvider from "@/components/home/dust/DustProvider";
import Lab from "./Lab";

export default function DustLab() {
  return (
    <DustProvider>
      <Lab />
    </DustProvider>
  );
}
