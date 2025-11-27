import { usePersistedState } from "@/hooks/aevr/use-persisted-state";

export interface SavedLink {
  id: string;
  createdAt: number;
  title?: string;
}

export interface LinkGroup {
  id: string;
  title: string;
  createdAt: number;
  linkIds: string[];
}

interface SavedLinksState {
  links: SavedLink[];
  groups: LinkGroup[];
}

export const useSavedLinks = () => {
  const { state, setState, isHydrated } = usePersistedState<SavedLinksState>({
    storageKey: "md-viewer-saved-links",
    enablePersistence: true,
  });

  // Initialize links and groups if undefined (first run)
  const links = state?.links || [];
  const groups = state?.groups || [];

  const saveLink = (id: string, title?: string) => {
    if (links.some((link) => link.id === id)) return;

    const newLink: SavedLink = {
      id,
      createdAt: Date.now(),
      title: title || `Markdown ${id.substring(0, 6)}`,
    };

    setState((prev) => ({
      links: [newLink, ...(prev?.links || [])],
      groups: prev?.groups || [],
    }));
  };

  const removeLink = (id: string) => {
    setState((prev) => ({
      links: (prev?.links || []).filter((link) => link.id !== id),
      // Also remove from any groups
      groups: (prev?.groups || []).map((group) => ({
        ...group,
        linkIds: group.linkIds.filter((linkId) => linkId !== id),
      })),
    }));
  };

  const isSaved = (id: string) => {
    return links.some((link) => link.id === id);
  };

  // Grouping functions
  const createGroup = async (title: string, linkIds: string[]) => {
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, linkIds }),
      });

      const result = await response.json();

      if (result.success) {
        const newGroup: LinkGroup = {
          id: result.data.id,
          title: result.data.title,
          createdAt: new Date(result.data.createdAt).getTime(),
          linkIds: result.data.linkIds,
        };

        setState((prev) => ({
          links: prev?.links || [],
          groups: [newGroup, ...(prev?.groups || [])],
        }));
        return newGroup;
      }
    } catch (error) {
      console.error("Failed to create group", error);
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      // Optimistic update
      setState((prev) => ({
        links: prev?.links || [],
        groups: (prev?.groups || []).filter((group) => group.id !== groupId),
      }));

      // If it's a server-side group (mongo ID), delete it from server
      if (!groupId.startsWith("group-")) {
        await fetch(`/api/groups/${groupId}`, {
          method: "DELETE",
        });
      }
    } catch (error) {
      console.error("Failed to delete group", error);
    }
  };

  const addToGroup = async (groupId: string, linkIds: string[]) => {
    // Optimistic update
    setState((prev) => ({
      links: prev?.links || [],
      groups: (prev?.groups || []).map((group) => {
        if (group.id === groupId) {
          const newIds = linkIds.filter((id) => !group.linkIds.includes(id));
          return { ...group, linkIds: [...group.linkIds, ...newIds] };
        }
        return group;
      }),
    }));

    // Server update
    if (!groupId.startsWith("group-")) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        const currentIds = group.linkIds;
        const newIds = linkIds.filter((id) => !currentIds.includes(id));
        await fetch(`/api/groups/${groupId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkIds: [...currentIds, ...newIds] }),
        });
      }
    }
  };

  const removeFromGroup = async (groupId: string, linkId: string) => {
    // Optimistic update
    setState((prev) => ({
      links: prev?.links || [],
      groups: (prev?.groups || []).map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            linkIds: group.linkIds.filter((id) => id !== linkId),
          };
        }
        return group;
      }),
    }));

    // Server update
    if (!groupId.startsWith("group-")) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        const newIds = group.linkIds.filter((id) => id !== linkId);
        await fetch(`/api/groups/${groupId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkIds: newIds }),
        });
      }
    }
  };

  return {
    links,
    groups,
    saveLink,
    removeLink,
    isSaved,
    createGroup,
    deleteGroup,
    addToGroup,
    removeFromGroup,
    isHydrated,
  };
};
