import React, { useContext } from "react";
import { InjectedRouter } from "react-router";
import { Command } from "cmdk";

import UnsupportedScreenSize from "layouts/UnsupportedScreenSize";

import { AppContext } from "context/app";
import { NotificationContext } from "context/notification";
import { TableContext } from "context/table";
import { INotification } from "interfaces/notification";

import paths from "router/paths";
import useDeepEffect from "hooks/useDeepEffect";
import FlashMessage from "components/FlashMessage";
import SiteTopNav from "components/top_nav/SiteTopNav";
import { QueryParams } from "utilities/url";

interface ICoreLayoutProps {
  children: React.ReactNode;
  router: InjectedRouter; // v3
  // TODO: standardize typing and usage of location across app components
  location: {
    pathname: string;
    search: string;
    hash?: string;
    query: QueryParams;
  };
}

const CommandMenu = ({ router }: { router: InjectedRouter }) => {
  const [open, setOpen] = React.useState(false);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command Pallete">
      <div className="pallete-search">
        <Command.Input placeholder="Type a command or search..." />
        <button className="pallete-esc-button" onClick={() => setOpen(false)}>
          Esc
        </button>
      </div>
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Pages">
          <Command.Item
            onSelect={() => {
              router.push(paths.MANAGE_HOSTS);
              setOpen(false);
            }}
          >
            <span>
              Go to <b>Hosts</b>
            </span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              router.push(paths.CONTROLS);
              setOpen(false);
            }}
          >
            <span>
              Go to <b>Controls</b>
            </span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              router.push(paths.SOFTWARE);
              setOpen(false);
            }}
          >
            <span>
              Go to <b>Software</b>
            </span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              router.push(paths.MANAGE_QUERIES);
              setOpen(false);
            }}
          >
            <span>
              Go to <b>Queries</b>
            </span>
          </Command.Item>
          <Command.Item
            onSelect={() => {
              router.push(paths.MANAGE_POLICIES);
              setOpen(false);
            }}
          >
            <span>
              Go to <b>Policies</b>
            </span>
          </Command.Item>
        </Command.Group>
        <Command.Group heading="Search">
          <Command.Item>
            <span>
              Search <b>Hosts</b>
            </span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

const CoreLayout = ({ children, router, location }: ICoreLayoutProps) => {
  const { config, currentUser } = useContext(AppContext);
  const { notification, hideFlash } = useContext(NotificationContext);
  const { setResetSelectedRows } = useContext(TableContext);

  // on success of an action, the table will reset its checkboxes.
  // setTimeout is to help with race conditions as table reloads
  // in some instances (i.e. Manage Hosts)
  useDeepEffect(() => {
    if (
      notification &&
      (notification as INotification).alertType === "success"
    ) {
      setTimeout(() => {
        setResetSelectedRows(true);
        setTimeout(() => {
          setResetSelectedRows(false);
        }, 300);
      }, 0);
    }
  }, [notification]);

  const onLogoutUser = async () => {
    const { LOGOUT } = paths;
    router.push(LOGOUT);
  };

  const onUserMenuItemClick = (path: string) => {
    router.push(path);
  };

  const fullWidthFlash = !currentUser;

  if (!currentUser || !config) {
    return null;
  }

  return (
    <div className="app-wrap">
      <CommandMenu router={router} />
      <UnsupportedScreenSize />
      <nav className="site-nav-container">
        <SiteTopNav
          config={config}
          currentUser={currentUser}
          location={location}
          onLogoutUser={onLogoutUser}
          onUserMenuItemClick={onUserMenuItemClick}
        />
      </nav>
      <div className="core-wrapper">
        <FlashMessage
          fullWidth={fullWidthFlash}
          notification={notification}
          onRemoveFlash={hideFlash}
          pathname={location.pathname}
        />

        {children}
      </div>
    </div>
  );
};

export default CoreLayout;
