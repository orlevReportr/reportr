import React from "react";
import EditIcon from "../icons/EditIcon";
import { useNavigate } from "react-router-dom";

function CustomizeLayout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="flex px-[30px]">
      <aside class="hidden md:flex customisationTable overflow-hidden w-[220px] sticky top-0 flex-shrink-0 svelte-4aftw5">
        <div class="h-full w-full">
          <nav
            aria-label="Docs sidebar"
            class="relative h-full overflow-y-hidden pt-10 pl-2 border-r overflow-x-hidden"
          >
            <div class="flex items-center text-labelTitle gap-3 w-full pl-[11px]">
              <div class="-mt-[2.4px]">
                <EditIcon />
              </div>{" "}
              <span className="text-[18px] font-medium">Customise</span>
            </div>{" "}
            <ul class="list-none mt-2 pl-8 text-[15px] space-y-2 m-0 w-full">
              <li
                onClick={() => {
                  navigate("/customize/reportr-ai-templates");
                }}
                class="cursor-pointer w-[90%] hover:bg-bgSelectedMuted  duration-75 rounded-[5px]"
                id="customise-general"
              >
                <span>Reportr AI Templates</span>
              </li>
              <li
                onClick={() => {
                  navigate("/customize/your-templates");
                }}
                class="cursor-pointer w-[90%] hover:bg-bgSelectedMuted bg-bgSelectedMuted duration-75 rounded-[5px]"
                id="customise-note-templates"
              >
                <span>Your Template</span>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      {children}
    </div>
  );
}

export default CustomizeLayout;
