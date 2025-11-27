import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, DocumentText, Folder } from "iconsax-react";

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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Group Not Found
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The group you are looking for does not exist or has been deleted.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const group = response.data;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft size={20} variant="Bulk" color="currentColor" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              <Folder size={28} variant="Bulk" className="text-indigo-500" />
              {group.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Created{" "}
              {formatDistanceToNow(new Date(group.createdAt), {
                addSuffix: true,
              })}{" "}
              • {group.links.length} items
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {group.links.map(
            (link: { _id: string; content: string; createdAt: string }) => (
              <div
                key={link._id}
                className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <DocumentText
                        size={24}
                        variant="Bulk"
                        color="currentColor"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Markdown Document
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {link.content.substring(0, 150)}...
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
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
                  <Link
                    href={`/view?id=${link._id}`}
                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
