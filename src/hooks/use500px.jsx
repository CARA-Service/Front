import { useState, useEffect } from "react";

export default function use500px() {
  const [is500px, setIs500px] = useState(
    window.matchMedia("(max-width: 500px)").matches
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 500px)");
    const listener = () => setIs500px(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  return is500px;
}
