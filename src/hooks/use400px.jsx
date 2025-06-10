import { useState, useEffect } from "react";

export default function use400px() {
  const [is400px, setIs400px] = useState(
    window.matchMedia("(max-width: 400px)").matches
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 400px)");
    const listener = () => setIs400px(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  return is400px;
}
