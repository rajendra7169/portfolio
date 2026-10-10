// The home page: one cloud of dust (DustProvider's fixed canvas) and seven
// sections that tell it what to become. See components/home/dust/README.md.
import DustProvider from "./dust/DustProvider";
import Hud from "./Hud";
import HeroDust from "./HeroDust";
import Kathmandu from "./Kathmandu";
import Blazify from "./Blazify";
import ListenTogether from "./ListenTogether";
import FourMatter from "./FourMatter";
import Shipped from "./Shipped";
import SayHello from "./SayHello";

export default function Home() {
  return (
    <DustProvider>
      <Hud />
      <HeroDust />
      <Kathmandu />
      <Blazify />
      <ListenTogether />
      <FourMatter />
      <Shipped />
      <SayHello />
    </DustProvider>
  );
}
