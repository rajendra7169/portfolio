// TEMPORARY lab route for section 6 (Shipped). Deleted once the home page is assembled.
import "@/components/home/css/ds.css";
import Motion from "@/components/Motion";
import DustProvider from "@/components/home/dust/DustProvider";
import Shipped from "@/components/home/Shipped";

export default function ShippedLab() {
  return (
    <Motion>
      <DustProvider>
        <div style={{ height: "100vh" }} aria-hidden />
        <Shipped />
        <div style={{ height: "120vh" }} aria-hidden />
      </DustProvider>
    </Motion>
  );
}
