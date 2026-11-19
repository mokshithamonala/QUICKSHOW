import {
  Building2,
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAuthUser } from "../../lib/auth";

const AdminSidebar = ({ adminUser }) => {
  const { user } = useAuthUser();

  const displayName =
    adminUser?.name ||
    user?.fullName ||
    user?.firstName ||
    "Administrator";
  const avatar = adminUser?.image || user?.imageUrl || assets.profile;

  const adminNavlinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon, end: true },
    { name: "Theaters", path: "/admin/theaters", icon: Building2, end: false },
    { name: "Add Shows", path: "/admin/add-shows", icon: PlusSquareIcon, end: false },
    { name: "List Shows", path: "/admin/list-shows", icon: ListIcon, end: false },
    {
      name: "List Bookings",
      path: "/admin/list-bookings",
      icon: ListCollapseIcon,
      end: false,
    },
  ];

  return (
    <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-14 md:max-w-60 w-full border-r border-gray-300/20 text-sm shrink-0">
      <img
        className="h-9 md:h-14 w-9 md:w-14 rounded-full object-cover mx-auto border border-red-600/40"
        src={avatar}
        alt={displayName}
      />
      <p className="mt-2 text-base font-medium max-md:hidden truncate max-w-[180px] px-2">
        {displayName}
      </p>
      <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold max-md:hidden">
        Verified Admin
      </span>

      <div className="w-full">
        {adminNavlinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end}
            className={({ isActive }) =>
              `relative flex items-center max-md:justify-center gap-2.5 w-full py-2.5 md:pl-10 first:mt-6 transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-gray-400 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className="w-5 h-5" />
                <p className="max-md:hidden">{link.name}</p>
                <span
                  className={`w-1.5 h-10 rounded-l right-0 absolute ${
                    isActive ? "bg-primary" : "hidden"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;