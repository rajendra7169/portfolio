import Tally from "@/components/worlds/tally/Tally";
import { worldPage } from "@/lib/world-page";

const { metadata, Page } = worldPage("tally", Tally);
export { metadata };
export default Page;
