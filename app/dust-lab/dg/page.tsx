// TEMPORARY lab route for the Listen Together section. Deleted before shipping.
import "@/components/home/css/dg.css";
import Motion from "@/components/Motion";
import DustProvider from "@/components/home/dust/DustProvider";
import ListenTogether from "@/components/home/ListenTogether";

export default function DustLabDg() {
  return (
    <Motion>
      <DustProvider>
        <div style={{ height: "100vh" }} aria-hidden />
        <ListenTogether />
        <div style={{ height: "120vh" }} aria-hidden />
      </DustProvider>
    </Motion>
  );
}
