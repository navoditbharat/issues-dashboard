import { useEffect } from "react";
import { useAtom } from "jotai";
import { useSearchParams } from "react-router-dom";
import { openIssueIdAtom, searchAtom, groupByAtom } from "@/atoms/tableState";
import { Issue } from "@/types/Issue";

export const useURLSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openIssueId, setOpenIssueId] = useAtom(openIssueIdAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [groupBy, setGroupBy] = useAtom(groupByAtom);

  useEffect(() => {
    const urlIssueId = searchParams.get("issueId");
    const urlSearch = searchParams.get("search");
    const urlGroupBy = searchParams.get("groupBy");

    if (urlIssueId && urlIssueId !== openIssueId) {
      setOpenIssueId(urlIssueId);
    }
    if (urlSearch && urlSearch !== search) {
      setSearch(urlSearch);
    }
    if (urlGroupBy && urlGroupBy !== groupBy) {
      setGroupBy(urlGroupBy as keyof Issue);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (openIssueId) {
      params.set("issueId", openIssueId);
    } else {
      params.delete("issueId");
    }

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (groupBy) {
      params.set("groupBy", groupBy);
    } else {
      params.delete("groupBy");
    }

    setSearchParams(params, { replace: true });
  }, [openIssueId, search, groupBy, setSearchParams]);
};
