import { useEffect } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { RoomPage } from "../features/room/RoomPage";
import { NotFoundPage } from "./NotFoundPage";

function RoomRoute() {
  const { code } = useParams();
  return <RoomPage key={code} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/r/:code" element={<RoomRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
