/**
=========================================================
* GoalTime App - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";
import SettingsModal from "layouts/profile/components/SettingsModal";

function GlobalSettingsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenSettings = () => {
      setOpen(true);
    };
    window.addEventListener("openSettingsModal", handleOpenSettings);
    return () => {
      window.removeEventListener("openSettingsModal", handleOpenSettings);
    };
  }, []);

  return <SettingsModal open={open} onClose={() => setOpen(false)} />;
}

export default GlobalSettingsModal;
