// ./app/group/[id]/page.tsx

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, DocumentText, Folder } from "iconsax-react";
import GroupShareButton from "@/components/group/group-share-button";
import { Button } from "@/components/ui/aevr/button";

async function getGroup(id: string) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/groups/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getGroup(id);

  if (!response || !response.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Group Not Found
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          The group you are looking for does not exist or has been deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const group = response.data;

  return (
    <div className="min-h-screen bg-neutral-50 p-2 lg:p-8 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary" className="p-2">
              <Link href="/">
                <ArrowLeft size={20} variant="Bulk" color="currentColor" />
              </Link>
            </Button>
            <div className="">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                <Folder
                  size={28}
                  variant="Bulk"
                  className="text-indigo-500"
                  color="currentColor"
                />
                {group.title}
              </h1>
              <div className="text-sm flex items-center flex-wrap text-neutral-500 dark:text-neutral-400">
                <span>
                  Created{" "}
                  {formatDistanceToNow(new Date(group.createdAt), {
                    addSuffix: true,
                  })}{" "}
                  •
                </span>
                <span>{group.links.length} items</span>
              </div>
            </div>
          </div>
          <GroupShareButton groupId={group._id} title={group.title} />
        </div>

        <div className="grid gap-4">
          {group.links.map(
            (link: { _id: string; content: string; createdAt: string }) => (
              <div
                key={link._id}
                className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex max-[28rem]:flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <DocumentText
                        size={24}
                        variant="Bulk"
                        color="currentColor"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Markdown Document
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {link.content.substring(0, 150)}...
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span>ID: {link._id}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(link.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/view?id=${link._id}`}>View</Link>
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
