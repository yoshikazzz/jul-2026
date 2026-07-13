import { Routes, Route } from "react-router";
import Reserved from "./Reserved";
import TripView from "./TripView";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Reserved />} />
      <Route path="/:code" element={<TripView />} />
    </Routes>
  );
}
