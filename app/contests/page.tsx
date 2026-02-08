"use client";

import { useEffect, useState } from "react";

export default function Contests() {
  const [contests, setContests] =
    useState<any[]>([]);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    const res = await fetch(
      "https://codeforces.com/api/contest.list"
    );

    const data = await res.json();

    const upcoming =
      data.result.filter(
        (c: any) =>
          c.phase === "BEFORE"
      );

    setContests(upcoming.slice(0, 10));
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Upcoming Contests 🏆
      </h1>

      <div className="mt-6 space-y-4">
        {contests.map(
          (c: any) => (
            <div
              key={c.id}
              className="border p-4 rounded"
            >
              <p className="font-bold">
                {c.name}
              </p>

              <p>
                Start:{" "}
                {new Date(
                  c.startTimeSeconds *
                    1000
                ).toLocaleString()}
              </p>

              <p>
                Duration:{" "}
                {Math.floor(
                  c.durationSeconds /
                    3600
                )}{" "}
                hrs
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
