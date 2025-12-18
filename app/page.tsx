import Image from "next/image";
import Navbar from "./components/Navbar";
import VideoFeedHero from "./components/Feed";
export default function Home() {
  return (
    <>
      <Navbar />
      <VideoFeedHero />
    </>

  );
}
