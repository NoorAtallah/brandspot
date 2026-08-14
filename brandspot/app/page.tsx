import Image from "next/image";
import Nav from "./components/layout/navbar";
import Hero from "./components/home/hero"
import OutfitBuilder from "./components/home/outfit-builder";
export default function Home() {
  return (
    <div >
      <Nav tone="light" />
      <Hero />
      <OutfitBuilder />
    </div>
  );
}
      
   
