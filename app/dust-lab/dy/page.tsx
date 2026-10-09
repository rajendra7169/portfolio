// TEMPORARY lab route for section 7 (Say hello). Deleted once the home page is assembled.
import "@/components/home/css/dy.css";
import Motion from "@/components/Motion";
import DustProvider from "@/components/home/dust/DustProvider";
import SayHello from "@/components/home/SayHello";

export default function SayHelloLab() {
  return (
    <Motion>
      <DustProvider>
        <div style={{ height: "100vh" }} aria-hidden />
        <SayHello />
        <div style={{ height: "120vh" }} aria-hidden />
      </DustProvider>
    </Motion>
  );
}
